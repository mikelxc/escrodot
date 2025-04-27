'use client';
import { useState } from 'react';
import { Abi, parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contracts } from 'contracts';

const escro = contracts['ae299c4a737574dbc859c5fd61fa6e79764a2d96'];
const address = escro.address as `0x${string}`;
const abi = escro.abi as unknown as Abi;

export function SellerPanel() {
  /* ---------- form state ---------- */
  const [price, setPrice]       = useState('');   // ETH as string
  const [stake, setStake]       = useState('');
  const [gateway, setGateway]   = useState('');

  const [svcId, setSvcId]       = useState('');
  const [purId, setPurId]       = useState('');
  const [hash,  setHash]        = useState<`0x${string}` | ''>('');

  /* ---------- wagmi ---------- */
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess }
    = useWaitForTransactionReceipt({
        hash: txHash,
        // enabled: !!txHash,
      });

  /* ---------- helpers ---------- */
  function createService() {
    writeContract({
      address,
      abi,
      functionName: 'createService',
      args: [parseEther(price), gateway],
      value: parseEther(stake),
    });
  }

  function deliver() {
    writeContract({
      address,
      abi,
      functionName: 'deliver',
      args: [
        BigInt(svcId),
        BigInt(purId),
        hash as `0x${string}`,
      ],
    });
  }

  /* ---------- UI ---------- */
  return (
    <section>
      <h2>Provider / Seller</h2>

      {/* CREATE */}
      <h3>Create service</h3>
      <input placeholder="Price (ETH)"   value={price}   onChange={e => setPrice(e.target.value)} />
      <input placeholder="Stake (ETH)"   value={stake}   onChange={e => setStake(e.target.value)} />
      <input placeholder="Gateway URL"   value={gateway} onChange={e => setGateway(e.target.value)} />
      <button disabled={isPending} onClick={createService}>
        {isPending ? 'Confirm…' : 'Create'}
      </button>
      {confirming && ' ⏳ waiting for confirmation…'}
      {isSuccess  && ' ✅ service created'}
      {error && <span style={{color:'red'}}>Error: {error.message}</span>}

      {/* DELIVER */}
      <h3 style={{marginTop:20}}>Mark deliverable</h3>
      <input placeholder="Service ID"         value={svcId} onChange={e => setSvcId(e.target.value)} />
      <input placeholder="Purchase ID"        value={purId} onChange={e => setPurId(e.target.value)} />
      <input placeholder="Deliverable hash"   value={hash}  onChange={e => setHash(e.target.value as `0x${string}`)} />
      <button disabled={isPending} onClick={deliver}>
        {isPending ? 'Confirm…' : 'Deliver'}
      </button>
    </section>
  );
}