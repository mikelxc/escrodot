//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EscroDotFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const escroDotFactoryAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'purchaseId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'refunded', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'arbiter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DisputeResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'name', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'escrow',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'provider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'stake',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ServiceDeployed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeToppedUp',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeWithdrawn',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'price', internalType: 'uint256', type: 'uint256' },
      { name: 'gateway', internalType: 'string', type: 'string' },
      { name: 'gatewaySigner', internalType: 'address', type: 'address' },
      { name: 'description', internalType: 'string', type: 'string' },
    ],
    name: 'createService',
    outputs: [{ name: 'escrow', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'serviceId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'purchaseId', internalType: 'uint256', type: 'uint256' },
      { name: 'refundBuyer', internalType: 'bool', type: 'bool' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'serviceId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'topUpStake',
    outputs: [],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [
      { name: 'serviceId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'listServices',
    outputs: [
      { name: 'ids', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'escrows', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'serviceIds',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'services',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'stakes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

export const escroDotFactoryAddress =
  '0xC9e25a24d6d98c3877817827E7d1f7a6C12D811f' as const

export const escroDotFactoryConfig = {
  address: escroDotFactoryAddress,
  abi: escroDotFactoryAbi,
} as const
