// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ECDSA.sol";
import "./SignatureVerifier.sol";

/**
 * @title EscroDot – minimal escrow & staking framework for AI‑agent services
 * @author Mike Liu (mikelxc)
 *
 /**
 * @title EscroDot – AI‑Agent Escrow (v0.4 – CCIP‑Read + Buyer‑Signed Claim + Open Arbiter)
 *
 * • Off‑chain delivery (ERC‑3668): `checkDelivery()` triggers CCIP‑Read. Gateway returns the
 *   AI result. The buyer inspects the output off‑chain and, if satisfied, signs a message that
 *   lets the provider claim funds.
 * • Buyer‑signed claim: `claimPayment()` is called by the provider, supplying the buyer's
 *   signature. Contract verifies and releases payment.
 * • Open Dispute Resolution: Any address can become an arbiter – it just needs to deposit a
 *   stake ≥ purchase value when calling `resolveDispute()`. (For brevity we return the stake in
 *   the same tx; extend with lock‑and‑slash logic in later versions.)
 */
contract ServiceEscrow {
    using ECDSA for bytes32;

    /// @notice Address of the factory that deployed this contract.
    address public immutable factory;

    /// @notice Deterministic service identifier = keccak256(serviceName).
    bytes32 public immutable serviceId;

    /// @notice Wallet address that owns the service and receives payments.
    address public immutable provider;

    /// @notice Fixed price (in wei) per purchase.
    uint256 public immutable price;

    /// @notice Human‑readable description or IPFS CID (mutable by provider).
    string  public description;

    /// @notice CCIP‑Read gateway URL (mutable by provider).
    string  public gateway;

    /// @notice CCIP‑Read gateway signer address (mutable by provider).
    address public gatewaySigner;

    /// @dev Incremental identifier for purchases.
    uint256 public nextPurchaseId;

    /**
     * @dev Track the lifecycle of each purchase.
     * @param buyer     Address that paid for the service.
     * @param amount    Amount of ETH locked (should equal `price`).
     * @param claimed   True if provider has successfully claimed the funds.
     * @param disputed  True if buyer raised a dispute.
     * @param resolved  True if factory resolved the dispute.
     */
    struct Purchase {
        address buyer;
        uint256 amount;
        bool    claimed;
        bool    disputed;
        bool    resolved;
    }
    mapping(uint256 => Purchase) public purchases; // pid ⇒ Purchase

     /// @notice Buyer successfully paid for the service.
    event ServicePurchased(uint256 indexed purchaseId, address indexed buyer, uint256 amount);

    /// @notice Off‑chain gateway supplied a deliverable hash for a purchase.
    event OffchainDelivery(uint256 indexed purchaseId, bytes32 deliverableHash);

    /// @notice Provider claimed the locked payment (buyer signature verified).
    event PaymentClaimed(uint256 indexed purchaseId);

    /// @notice Buyer flagged the purchase for dispute.
    event DisputeRaised(uint256 indexed purchaseId);

    /// @dev See EIP‑3668 for parameter semantics.
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    /// @dev Restrict a function to the provider of this service.
    modifier onlyProvider() {
        require(msg.sender == provider, "Escrow: caller is not the provider");
        _;
    }

    /// @dev Restrict a function to the factory that deployed this contract.
    modifier onlyFactory() {
        require(msg.sender == factory, "Escrow: caller is not the factory");
        _;
    }

    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "Escrow: reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    /**
     * @param _factory      Address of the EscroDotFactory contract.
     * @param _serviceId    keccak256 hash of the chosen service name.
     * @param _provider     Owner of the service.
     * @param _price        Fixed price per purchase (wei).
     * @param _gateway      HTTPS/IPFS URL implementing the CCIP‑Read spec.
     * @param _gatewaySigner Address of the CCIP‑Read gateway signer.
     * @param _description  Short text or IPFS CID describing the service.
     */
    constructor(
        address _factory,
        bytes32 _serviceId,
        address _provider,
        uint256 _price,
        string memory _gateway,
        address _gatewaySigner,
        string memory _description
    ) {
        require(_factory != address(0), "Escrow: factory is zero address");
        require(_provider != address(0), "Escrow: provider is zero address");
        require(_price > 0, "Escrow: price must be > 0");
        require(bytes(_gateway).length > 0, "Escrow: gateway cannot be empty");
        require(_gatewaySigner != address(0), "Escrow: gateway signer cannot be zero address");
        factory      = _factory;
        serviceId    = _serviceId;
        provider     = _provider;
        price        = _price;
        gateway      = _gateway;
        gatewaySigner = _gatewaySigner;
        description  = _description;
    }

    /**
     * @notice Purchase the service by locking `price` ETH in this contract.
     * @return purchaseId  A unique identifier for this purchase.
     */
    function buyService() external payable nonReentrant returns (uint256 purchaseId) {
        require(msg.value == price, "Escrow: incorrect payment amount");

        purchaseId = nextPurchaseId++;
        purchases[purchaseId] = Purchase({
            buyer: msg.sender,
            amount: msg.value,
            claimed: false,
            disputed: false,
            resolved: false
        });

        emit ServicePurchased(purchaseId, msg.sender, msg.value);
    }

    /**
     * @notice Trigger an ERC‑3668 OffchainLookup so that a gateway can return the deliverable.
     * @param purchaseId  Identifier of the purchase to query.
     * @param userInput   Arbitrary payload forwarded to the gateway (e.g., API key, prompt).
     *
     * The caller MUST handle the OffchainLookup error, perform the HTTPS request(s) to the
     * provided `gateway`, then call `ccipCallback` with the ABI‑encoded response.
     */
    function checkDelivery(uint256 purchaseId, bytes calldata userInput) external view {
        require(purchases[purchaseId].amount > 0, "Escrow: invalid purchase id");

        string[] memory urls = new string[](1);
        urls[0] = gateway;

        revert OffchainLookup({
            sender: address(this),
            urls: urls,
            callData: abi.encode(userInput, purchaseId),
            callbackFunction: this.ccipCallback.selector,
            extraData: abi.encode(purchaseId)
        });
    }

    /**
     * @notice CCIP‑Read callback that simply logs the deliverable hash off‑chain.
     * @dev  No state change other than the event emission so the provider can later claim.
     */
    function ccipCallback(bytes calldata response, bytes calldata extraData)
        external
        view
        returns (bytes memory)
    {
        (address signer, bytes memory result) = SignatureVerifier.verify(
            extraData,
            response
        );
        require(signer == gatewaySigner, "SignatureVerifier: Invalid signature");
        return result;
    }

    /**
     * @notice Provider claims funds by presenting a buyer‑signed message.
     * @param purchaseId       Identifier of the purchase to claim.
     * @param deliverableHash  Hash returned by the CCIP gateway (buyer has inspected).
     * @param buyerSignature   ECDSA signature of the buyer over the claim digest.
     */
    function claimPayment(
        uint256 purchaseId,
        bytes32 deliverableHash,
        bytes calldata buyerSignature
    ) external nonReentrant onlyProvider {
        Purchase storage purchase = purchases[purchaseId];

        require(!purchase.claimed,  "Escrow: payment already claimed");
        require(!purchase.disputed, "Escrow: purchase is in dispute");

        // Verify buyer signature.
        bytes32 digest = _claimDigest(purchaseId, deliverableHash);
        address signer = ECDSA.recover(digest, buyerSignature);
        require(signer == purchase.buyer, "SignatureVerifier: Invalid signature");

        purchase.claimed = true;
        _sendETH(payable(provider), purchase.amount);

        emit PaymentClaimed(purchaseId);
    }

    function raiseDispute(uint256 purchaseId) external {
        Purchase storage purchase = purchases[purchaseId];

        require(msg.sender == purchase.buyer, "Escrow: caller is not the buyer");
        require(!purchase.claimed,           "Escrow: payment already claimed");
        require(!purchase.disputed,          "Escrow: dispute already raised");

        purchase.disputed = true;
        emit DisputeRaised(purchaseId);
    }

    /**
     * @dev Refunds the buyer – callable only by the factory after successful arbitration.
     */
    function factoryRefundBuyer(uint256 purchaseId) external onlyFactory nonReentrant {
        Purchase storage purchase = purchases[purchaseId];
        require(purchase.disputed && !purchase.resolved, "Escrow: invalid state");

        purchase.resolved = true;
        _sendETH(payable(purchase.buyer), purchase.amount);
    }

    /**
     * @dev Releases funds to the provider – callable only by the factory.
     */
    function factoryReleaseToProvider(uint256 purchaseId) external onlyFactory nonReentrant {
        Purchase storage purchase = purchases[purchaseId];
        require(!purchase.claimed && purchase.disputed && !purchase.resolved, "Escrow: invalid state");

        purchase.resolved = true;
        _sendETH(payable(provider), purchase.amount);
    }

    /**
     * @notice Update the CCIP gateway URL.
     */
    function updateGateway(string calldata newGateway) external onlyProvider {
        require(bytes(newGateway).length > 0, "Escrow: gateway cannot be empty");
        gateway = newGateway;
    }

    /**
     * @notice Update the human‑readable description.
     */
    function updateDescription(string calldata newDescription) external onlyProvider {
        description = newDescription;
    }

    /**
     * @notice Update the CCIP gateway signer address.
     */
    function updateGatewaySigner(address newSigner) external onlyProvider {
        require(newSigner != address(0), "Escrow: signer cannot be zero address");
        gatewaySigner = newSigner;
    }

    /**
     * @dev Compute the digest that a buyer must sign to authorise payment.
     */
    function claimDigest(uint256 purchaseId, bytes32 deliverableHash) external view returns (bytes32) {
        return _claimDigest(purchaseId, deliverableHash);
    }

    /**
     * @dev Internal: generate claim digest without message prefix.
     */
    function _claimDigest(uint256 purchaseId, bytes32 deliverableHash) internal view returns (bytes32) {
        return keccak256(abi.encode(address(this), purchaseId, deliverableHash));
    }

    /**
     * @dev Internal helper to send ETH and bubble up any failure.
     */
    function _sendETH(address payable to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Escrow: ETH transfer failed");
    }

    /// @notice Receive function – allows provider to top‑up escrow if ever needed.
    receive() external payable {}
}

/**
 * @title EscroDotFactory
 * @notice Deploys ServiceEscrow contracts and manages provider stakes & arbitration.
 */
contract EscroDotFactory {
    /* ---------------------------------------------------------------------- */
    /*                              Service Registry                           */
    /* ---------------------------------------------------------------------- */

    /// @notice Map: serviceId ⇒ ServiceEscrow contract address.
    mapping(bytes32 => address) public services;

    /// @notice List of all serviceIds (for off‑chain pagination).
    bytes32[] public serviceIds;

    /* ---------------------------------------------------------------------- */
    /*                                 Stakes                                  */
    /* ---------------------------------------------------------------------- */

    /// @notice Map: serviceId ⇒ provider's collateral (held by factory).
    mapping(bytes32 => uint256) public stakes;

    /* ---------------------------------------------------------------------- */
    /*                                   Events                                */
    /* ---------------------------------------------------------------------- */

    /// @notice New service deployed.
    event ServiceDeployed(bytes32 indexed serviceId, string name, address escrow, address indexed provider, uint256 stake);

    /// @notice Provider topped up their stake.
    event StakeToppedUp(bytes32 indexed serviceId, uint256 amount, uint256 newTotal);

    /// @notice Provider withdrew part of their stake.
    event StakeWithdrawn(bytes32 indexed serviceId, uint256 amount, uint256 newTotal);

    /// @notice Dispute resolved by an arbiter.
    event DisputeResolved(bytes32 indexed serviceId, uint256 indexed purchaseId, bool refunded, address indexed arbiter);

    /**
     * @param name         Human‑readable service name (unique).
     * @param price        Fixed price in wei.
     * @param gateway      CCIP‑Read endpoint.
     * @param description  IPFS CID or text description.
     *
     * `msg.value` – initial stake (must be ≥ `price`).
     */
    function createService(
        string calldata name,
        uint256 price,
        string calldata gateway,
        address gatewaySigner,
        string calldata description
    ) external payable returns (address escrow) {
        require(bytes(name).length > 0, "Factory: name cannot be empty");
        require(msg.value >= price,     "Factory: stake must cover at least one refund");

        bytes32 serviceId = keccak256(bytes(name));
        require(services[serviceId] == address(0), "Factory: service name already taken");

        ServiceEscrow newEscrow = new ServiceEscrow({
            _factory: address(this),
            _serviceId: serviceId,
            _provider: msg.sender,
            _price: price,
            _gateway: gateway,
            _gatewaySigner: gatewaySigner,
            _description: description
        });

        services[serviceId] = address(newEscrow);
        serviceIds.push(serviceId);
        stakes[serviceId] = msg.value;

        emit ServiceDeployed(serviceId, name, address(newEscrow), msg.sender, msg.value);

        return address(newEscrow);
    }

    /** @notice Increase stake for a service. */
    function topUpStake(bytes32 serviceId) external payable {
        address escrowAddr = services[serviceId];
        require(escrowAddr != address(0), "Factory: unknown service");

        // Only the service provider can top‑up
        require(msg.sender == ServiceEscrow(payable(escrowAddr)).provider(), "Factory: caller is not provider");

        stakes[serviceId] += msg.value;
        emit StakeToppedUp(serviceId, msg.value, stakes[serviceId]);
    }

    /**
     * @notice Withdraw unused stake (cannot exceed balance held by factory).
     */
    function withdrawStake(bytes32 serviceId, uint256 amount) external {
        address escrowAddr = services[serviceId];
        require(escrowAddr != address(0), "Factory: unknown service");

        ServiceEscrow escrow = ServiceEscrow(payable(escrowAddr));
        require(msg.sender == escrow.provider(), "Factory: caller is not provider");
        require(amount <= stakes[serviceId], "Factory: insufficient stake balance");

        stakes[serviceId] -= amount;
        _sendETH(payable(msg.sender), amount);

        emit StakeWithdrawn(serviceId, amount, stakes[serviceId]);
    }

    /**
     * @notice Resolve a dispute. Anyone can act as arbiter by bonding ≥ price.
     * @param serviceId   Service identifier.
     * @param purchaseId  Identifier within the ServiceEscrow contract.
     * @param refundBuyer If true, refund buyer; otherwise release to provider.
     */
    function resolveDispute(
        bytes32 serviceId,
        uint256 purchaseId,
        bool refundBuyer
    ) external payable {
        address escrowAddr = services[serviceId];
        require(escrowAddr != address(0), "Factory: unknown service");

        ServiceEscrow escrow = ServiceEscrow(payable(escrowAddr));

        // Require a bond ≥ price to discourage frivolous rulings.
        require(msg.value >= escrow.price(), "Factory: arbiter bond too low");

        if (refundBuyer) {
            require(stakes[serviceId] >= escrow.price(), "Factory: provider stake insufficient");
            stakes[serviceId] -= escrow.price();
            escrow.factoryRefundBuyer(purchaseId);
        } else {
            // Provider wins; no slash.
            escrow.factoryReleaseToProvider(purchaseId);
        }

        // Return arbiter bond immediately in v1.2. Extend with delayed release in prod.
        _sendETH(payable(msg.sender), msg.value);

        emit DisputeResolved(serviceId, purchaseId, refundBuyer, msg.sender);
    }

    /// @return ids         Array of all service IDs.
    /// @return escrows     Parallel array of escrow contract addresses.
    function listServices() external view returns (bytes32[] memory ids, address[] memory escrows) {
        ids     = serviceIds;
        escrows = new address[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            escrows[i] = services[ids[i]];
        }
    }

    function _sendETH(address payable to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Factory: ETH transfer failed");
    }

    receive() external payable {
        revert("Factory: direct ETH not accepted");
    }
}