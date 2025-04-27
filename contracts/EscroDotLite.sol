// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title EscroDot – minimal escrow & staking framework for AI‑agent services
 * @author Mike Liu (mikelxc)
 *
 * @title EscroDot – AI‑Agent Escrow (v0.4 – Buyer‑Signed Claim + Open Arbiter)
 *
 * • Buyer‑signed claim: `claimPayment()` is called by the provider, supplying the buyer's
 *   signature. Contract verifies and releases payment.
 * • Open Dispute Resolution: Any address can become an arbiter – it just needs to deposit a
 *   stake ≥ purchase value when calling `resolveDispute()`. (For brevity we return the stake in
 *   the same tx; extend with lock‑and‑slash logic in later versions.)
 */

library ECDSA {
    enum RecoverError {
        NoError,
        InvalidSignature,
        InvalidSignatureLength,
        InvalidSignatureS
    }

    /**
     * @dev The signature derives the `address(0)`.
     */
    error ECDSAInvalidSignature();

    /**
     * @dev The signature has an invalid length.
     */
    error ECDSAInvalidSignatureLength(uint256 length);

    /**
     * @dev The signature has an S value that is in the upper half order.
     */
    error ECDSAInvalidSignatureS(bytes32 s);

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with `signature` or an error. This will not
     * return address(0) without also returning an error description. Errors are documented using an enum (error type)
     * and a bytes32 providing additional information about the error.
     *
     * If no error is returned, then the address can be used for verification purposes.
     *
     * The `ecrecover` EVM precompile allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {MessageHashUtils-toEthSignedMessageHash} on it.
     *
     * Documentation for signature generation:
     * - with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
     * - with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]
     */
    function tryRecover(bytes32 hash, bytes memory signature) internal pure returns (address, RecoverError, bytes32) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            // ecrecover takes the signature parameters, and the only way to get them
            // currently is to use assembly.
            /// @solidity memory-safe-assembly
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            return tryRecover(hash, v, r, s);
        } else {
            return (address(0), RecoverError.InvalidSignatureLength, bytes32(signature.length));
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM precompile allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {MessageHashUtils-toEthSignedMessageHash} on it.
     */
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, signature);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.
     *
     * See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]
     */
    function tryRecover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address, RecoverError, bytes32) {
        unchecked {
            bytes32 s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
            // We do not check for an overflow here since the shift operation results in 0 or 1.
            uint8 v = uint8((uint256(vs) >> 255) + 27);
            return tryRecover(hash, v, r, s);
        }
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
     */
    function recover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, r, vs);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function tryRecover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address, RecoverError, bytes32) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return (address(0), RecoverError.InvalidSignatureS, s);
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) {
            return (address(0), RecoverError.InvalidSignature, bytes32(0));
        }

        return (signer, RecoverError.NoError, bytes32(0));
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
        (address recovered, RecoverError error, bytes32 errorArg) = tryRecover(hash, v, r, s);
        _throwError(error, errorArg);
        return recovered;
    }

    /**
     * @dev Optionally reverts with the corresponding custom error according to the `error` argument provided.
     */
    function _throwError(RecoverError error, bytes32 errorArg) private pure {
        if (error == RecoverError.NoError) {
            return; // no error: do nothing
        } else if (error == RecoverError.InvalidSignature) {
            revert ECDSAInvalidSignature();
        } else if (error == RecoverError.InvalidSignatureLength) {
            revert ECDSAInvalidSignatureLength(uint256(errorArg));
        } else if (error == RecoverError.InvalidSignatureS) {
            revert ECDSAInvalidSignatureS(errorArg);
        }
    }
}

contract EscroDot {
    using ECDSA for bytes32;

    /* ---------------------------------------------------------------------- */
    /*                              Service Registry                           */
    /* ---------------------------------------------------------------------- */

    /// @notice Map: serviceId ⇒ Service data
    mapping(bytes32 => Service) public services;

    /// @notice List of all serviceIds (for off‑chain pagination)
    bytes32[] public serviceIds;

    /// @notice Map: serviceId ⇒ provider's collateral
    mapping(bytes32 => uint256) public stakes;

    /// @notice Map: serviceId ⇒ purchaseId ⇒ Purchase
    mapping(bytes32 => mapping(uint256 => Purchase)) public purchases;

    /// @notice Map: serviceId ⇒ next purchase ID
    mapping(bytes32 => uint256) public nextPurchaseIds;

    struct Service {
        address provider;
        uint256 price;
        string description;
        string gateway;
    }

    struct Purchase {
        address buyer;
        uint256 amount;
        bool claimed;
        bool disputed;
        bool resolved;
    }

    /* ---------------------------------------------------------------------- */
    /*                                   Events                                */
    /* ---------------------------------------------------------------------- */

    /// @notice New service deployed
    event ServiceDeployed(bytes32 indexed serviceId, string name, address indexed provider, uint256 stake);

    /// @notice Service updated
    event ServiceUpdated(bytes32 indexed serviceId, string description, string gateway);

    /// @notice Provider topped up their stake
    event StakeToppedUp(bytes32 indexed serviceId, uint256 amount, uint256 newTotal);

    /// @notice Provider withdrew part of their stake
    event StakeWithdrawn(bytes32 indexed serviceId, uint256 amount, uint256 newTotal);

    /// @notice Buyer successfully paid for the service
    event ServicePurchased(bytes32 indexed serviceId, uint256 indexed purchaseId, address indexed buyer, uint256 amount);

    /// @notice Provider claimed the locked payment (buyer signature verified)
    event PaymentClaimed(bytes32 indexed serviceId, uint256 indexed purchaseId);

    /// @notice Buyer flagged the purchase for dispute
    event DisputeRaised(bytes32 indexed serviceId, uint256 indexed purchaseId);

    /// @notice Dispute resolved by an arbiter
    event DisputeResolved(bytes32 indexed serviceId, uint256 indexed purchaseId, bool refunded, address indexed arbiter);

    /// @dev Restrict a function to the provider of a service
    modifier onlyProvider(bytes32 serviceId) {
        require(msg.sender == services[serviceId].provider, "Escrow: caller is not the provider");
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
     * @notice Create a new service
     * @param name         Human‑readable service name (unique)
     * @param price        Fixed price in wei
     * @param gateway      Service endpoint URL
     * @param description  IPFS CID or text description
     *
     * `msg.value` – initial stake (must be ≥ `price`)
     */
    function createService(
        string calldata name,
        uint256 price,
        string calldata gateway,
        string calldata description
    ) external payable returns (bytes32 serviceId) {
        require(bytes(name).length > 0, "Escrow: name cannot be empty");
        require(msg.value >= price, "Escrow: stake must cover at least one refund");
        require(bytes(gateway).length > 0, "Escrow: gateway cannot be empty");

        serviceId = keccak256(bytes(name));
        require(services[serviceId].provider == address(0), "Escrow: service name already taken");

        services[serviceId] = Service({
            provider: msg.sender,
            price: price,
            description: description,
            gateway: gateway
        });

        serviceIds.push(serviceId);
        stakes[serviceId] = msg.value;

        emit ServiceDeployed(serviceId, name, msg.sender, msg.value);
    }

    /**
     * @notice Update service details
     */
    function updateService(
        bytes32 serviceId,
        string calldata description,
        string calldata gateway
    ) external onlyProvider(serviceId) {
        require(bytes(gateway).length > 0, "Escrow: gateway cannot be empty");

        Service storage service = services[serviceId];
        service.description = description;
        service.gateway = gateway;

        emit ServiceUpdated(serviceId, description, gateway);
    }

    /**
     * @notice Purchase the service by locking `price` ETH in this contract
     */
    function buyService(bytes32 serviceId) external payable nonReentrant returns (uint256 purchaseId) {
        Service storage service = services[serviceId];
        require(service.provider != address(0), "Escrow: service does not exist");
        require(msg.value == service.price, "Escrow: incorrect payment amount");

        purchaseId = nextPurchaseIds[serviceId]++;
        purchases[serviceId][purchaseId] = Purchase({
            buyer: msg.sender,
            amount: msg.value,
            claimed: false,
            disputed: false,
            resolved: false
        });

        emit ServicePurchased(serviceId, purchaseId, msg.sender, msg.value);
    }

    /**
     * @notice Provider claims funds by presenting a buyer‑signed message
     */
    function claimPayment(
        bytes32 serviceId,
        uint256 purchaseId,
        bytes32 deliverableHash,
        bytes calldata buyerSignature
    ) external nonReentrant onlyProvider(serviceId) {
        Purchase storage purchase = purchases[serviceId][purchaseId];

        require(!purchase.claimed, "Escrow: payment already claimed");
        require(!purchase.disputed, "Escrow: purchase is in dispute");

        // Verify buyer signature
        bytes32 digest = _claimDigest(serviceId, purchaseId, deliverableHash);
        address signer = ECDSA.recover(digest, buyerSignature);
        require(signer == purchase.buyer, "SignatureVerifier: Invalid signature");

        purchase.claimed = true;
        _sendETH(payable(services[serviceId].provider), purchase.amount);

        emit PaymentClaimed(serviceId, purchaseId);
    }

    function raiseDispute(bytes32 serviceId, uint256 purchaseId) external {
        Purchase storage purchase = purchases[serviceId][purchaseId];

        require(msg.sender == purchase.buyer, "Escrow: caller is not the buyer");
        require(!purchase.claimed, "Escrow: payment already claimed");
        require(!purchase.disputed, "Escrow: dispute already raised");

        purchase.disputed = true;
        emit DisputeRaised(serviceId, purchaseId);
    }

    /**
     * @notice Resolve a dispute. Anyone can act as arbiter by bonding ≥ price
     */
    function resolveDispute(
        bytes32 serviceId,
        uint256 purchaseId,
        bool refundBuyer
    ) external payable nonReentrant {
        Service storage service = services[serviceId];
        Purchase storage purchase = purchases[serviceId][purchaseId];

        require(service.provider != address(0), "Escrow: service does not exist");
        require(purchase.disputed && !purchase.resolved, "Escrow: invalid state");
        require(msg.value >= service.price, "Escrow: arbiter bond too low");

        if (refundBuyer) {
            require(stakes[serviceId] >= service.price, "Escrow: provider stake insufficient");
            stakes[serviceId] -= service.price;
            purchase.resolved = true;
            _sendETH(payable(purchase.buyer), purchase.amount);
        } else {
            purchase.resolved = true;
            _sendETH(payable(service.provider), purchase.amount);
        }

        // Return arbiter bond immediately in v1.2. Extend with delayed release in prod
        _sendETH(payable(msg.sender), msg.value);

        emit DisputeResolved(serviceId, purchaseId, refundBuyer, msg.sender);
    }

    /** @notice Increase stake for a service */
    function topUpStake(bytes32 serviceId) external payable onlyProvider(serviceId) {
        stakes[serviceId] += msg.value;
        emit StakeToppedUp(serviceId, msg.value, stakes[serviceId]);
    }

    /**
     * @notice Withdraw unused stake (cannot exceed balance held by contract)
     */
    function withdrawStake(bytes32 serviceId, uint256 amount) external onlyProvider(serviceId) {
        require(amount <= stakes[serviceId], "Escrow: insufficient stake balance");
        stakes[serviceId] -= amount;
        _sendETH(payable(msg.sender), amount);
        emit StakeWithdrawn(serviceId, amount, stakes[serviceId]);
    }

    /// @return ids Array of all service IDs
    function listServices() external view returns (bytes32[] memory ids) {
        ids = serviceIds;
    }

    /**
     * @dev Compute the digest that a buyer must sign to authorise payment
     */
    function claimDigest(bytes32 serviceId, uint256 purchaseId, bytes32 deliverableHash) external view returns (bytes32) {
        return _claimDigest(serviceId, purchaseId, deliverableHash);
    }

    /**
     * @dev Internal: generate claim digest without message prefix
     */
    function _claimDigest(bytes32 serviceId, uint256 purchaseId, bytes32 deliverableHash) internal view returns (bytes32) {
        return keccak256(abi.encode(address(this), serviceId, purchaseId, deliverableHash));
    }

    /**
     * @dev Internal helper to send ETH and bubble up any failure
     */
    function _sendETH(address payable to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Escrow: ETH transfer failed");
    }

    receive() external payable {}
}