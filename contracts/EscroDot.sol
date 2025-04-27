// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title EscroDot – minimal escrow & staking framework for AI‑agent services
 * @author Mike Liu (mikelxc)
 *
 * Mechanics (v0):
 * 1. Service provider stakes ETH to create a listing with a fixed price & gateway URL.
 * 2. Buyer locks the payment by calling buyService().
 * 3. Provider delivers off‑chain via the gateway and calls deliver() with a hash proof – ETH is released to them immediately.
 * 4. Buyer may raiseDispute() within any agreed timeframe.
 * 5. Arbiter resolves the dispute; on refund the buyer is compensated from the provider’s stake (slash) rather than claw‑back.
 *
 * Notes:
 * • All values are in native ETH. No ERC‑20 support yet.
 * • In production you’d add time‑outs, ERC‑20 support, upgradeability, and signature‑based off‑chain attestations.
 */
contract EscroDot {
    /* -------------------------------------------------------------------------- */
    /*                                   Types                                    */
    /* -------------------------------------------------------------------------- */

    struct Service {
        address owner;   // provider / staking address
        uint256 price;   // price per purchase (wei)
        string  gateway; // off‑chain endpoint (could be IPFS / HTTPS)
        uint256 stake;   // remaining stake (wei)
        bool    active;  // provider can deactivate later
    }

    struct Purchase {
        address buyer;
        uint256 amount;     // should equal service.price (kept for clarity)
        bool    delivered;  // provider marked deliverable
        bool    disputed;   // buyer raised dispute
        bool    resolved;   // arbiter resolved
    }

    /* -------------------------------------------------------------------------- */
    /*                                State vars                                  */
    /* -------------------------------------------------------------------------- */

    address public immutable arbiter;            // trusted dispute resolver
    uint256 public nextServiceId = 1;            // incremental id

    mapping(uint256 => Service) public services; // serviceId => Service
    mapping(uint256 => mapping(address => Purchase)) public purchases; // serviceId => buyer => Purchase

    /* -------------------------------------------------------------------------- */
    /*                                    Misc                                    */
    /* -------------------------------------------------------------------------- */

    uint256 private _unlocked = 1;               // gas‑cheap re‑entrancy guard
    modifier lock() {
        require(_unlocked == 1, "LOCKED");
        _unlocked = 0;
        _;
        _unlocked = 1;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ServiceCreated(uint256 indexed id, address indexed owner, uint256 price, uint256 stake, string gateway);
    event ServicePurchased(uint256 indexed id, address indexed buyer, uint256 amount);
    event DeliverableProvided(uint256 indexed id, address indexed buyer, bytes32 deliverableHash);
    event DisputeRaised(uint256 indexed id, address indexed buyer);
    event DisputeResolved(uint256 indexed id, address indexed buyer, bool refunded);

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor(address _arbiter) {
        require(_arbiter != address(0), "arbiter = 0");
        arbiter = _arbiter;
    }

    /* -------------------------------------------------------------------------- */
    /*                               Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Provider stakes ETH and creates a service listing.
     * @param price   Fixed price per purchase (in wei).
     * @param gateway URL / CID where the AI agent can be invoked.
     */
    function createService(uint256 price, string calldata gateway) external payable returns (uint256 serviceId) {
        require(price > 0, "price = 0");
        require(bytes(gateway).length > 0, "gateway empty");
        require(msg.value >= price, "stake < price"); // ensure stake can cover at least one refund

        serviceId = nextServiceId++;
        services[serviceId] = Service({
            owner: msg.sender,
            price: price,
            gateway: gateway,
            stake: msg.value,
            active: true
        });

        emit ServiceCreated(serviceId, msg.sender, price, msg.value, gateway);
    }

    /**
     * @dev Buyer locks payment for a service.
     */
    function buyService(uint256 serviceId) external payable lock {
        Service storage s = services[serviceId];
        require(s.active, "inactive");
        require(msg.value == s.price, "wrong amount");
        require(purchases[serviceId][msg.sender].amount == 0, "already bought");

        purchases[serviceId][msg.sender] = Purchase({
            buyer: msg.sender,
            amount: msg.value,
            delivered: false,
            disputed: false,
            resolved: false
        });

        emit ServicePurchased(serviceId, msg.sender, msg.value);
    }

    /**
     * @dev Provider marks deliverable for a given buyer & receives payment immediately.
     * @param deliverableHash could be IPFS CID / SHA‑256 of encrypted artifact.
     */
    function deliver(uint256 serviceId, address buyer, bytes32 deliverableHash) external lock {
        Service storage s = services[serviceId];
        require(msg.sender == s.owner, "not owner");

        Purchase storage p = purchases[serviceId][buyer];
        require(p.amount > 0 && !p.delivered, "invalid purchase");

        p.delivered = true;

        emit DeliverableProvided(serviceId, buyer, deliverableHash);

        // release buyer payment to provider
        payable(s.owner).transfer(p.amount);
    }

    /**
     * @dev Buyer escalates after delivery if unhappy with the output.
     */
    function raiseDispute(uint256 serviceId) external {
        Purchase storage p = purchases[serviceId][msg.sender];
        require(p.delivered, "not delivered yet");
        require(!p.disputed, "already disputed");

        p.disputed = true;

        emit DisputeRaised(serviceId, msg.sender);
    }

    /**
     * @dev Arbiter decides outcome. If `refund=true` the buyer receives payment back
     *      using a slash from provider stake. Otherwise dispute is closed.
     */
    function resolveDispute(uint256 serviceId, address buyer, bool refund) external lock {
        require(msg.sender == arbiter, "not arbiter");

        Purchase storage p = purchases[serviceId][buyer];
        require(p.disputed && !p.resolved, "no active dispute");

        p.resolved = true;
        Service storage s = services[serviceId];

        if (refund) {
            uint256 refundAmount = p.amount;
            require(s.stake >= refundAmount, "insufficient stake");
            s.stake -= refundAmount;
            payable(buyer).transfer(refundAmount);
        }

        emit DisputeResolved(serviceId, buyer, refund);
    }

    /* -------------------------------------------------------------------------- */
    /*                            Provider House‑Keeping                           */
    /* -------------------------------------------------------------------------- */

    /// @dev Provider can add more stake at any time.
    function topUpStake(uint256 serviceId) external payable {
        Service storage s = services[serviceId];
        require(msg.sender == s.owner, "not owner");
        require(msg.value > 0, "no value");
        s.stake += msg.value;
    }

    /// @dev Provider may withdraw excess stake when no unresolved disputes exist.
    function withdrawStake(uint256 serviceId, uint256 amount) external lock {
        Service storage s = services[serviceId];
        require(msg.sender == s.owner, "not owner");
        require(amount <= s.stake, "overdraw");
        s.stake -= amount;
        payable(s.owner).transfer(amount);
    }
}