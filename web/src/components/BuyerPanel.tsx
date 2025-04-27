'use client';
import { useState } from 'react';
import { formatEther, Abi } from 'viem';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { contracts } from 'contracts';

const escro   = contracts['ae299c4a737574dbc859c5fd61fa6e79764a2d96'];
const address = escro.address as `0x${string}`;
const abi     = escro.abi as unknown as Abi;

export function BuyerPanel() {
  const [svcId,   setSvcId]   = useState('');
  const [purId,   setPurId]   = useState('');

  /* ---------- read service ---------- */
  const { data: svc } = useReadContract({
    address,
    abi,
    functionName: 'services',
    args: svcId ? [BigInt(svcId)] : undefined,
    query: { enabled: Boolean(svcId) },
  });

  /* ---------- write / dispute ---------- */
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

  function buy() {
    if (!svc) return;
    writeContract({
      address,
      abi,
      functionName: 'buyService',
      args: [BigInt(svcId)],
      value: svc.price as bigint,
    });
  }

  function dispute() {
    writeContract({
      address,
      abi,
      functionName: 'raiseDispute',
      args: [BigInt(svcId), BigInt(purId)],
    });
  }

  return (
    <section>
      <h2>Buyer</h2>

      {/* BUY */}
      <h3>Buy service</h3>
      <input placeholder="Service ID" value={svcId} onChange={e => setSvcId(e.target.value)} />
      {svc && (
        <p>Price: {formatEther(svc.price)} ETH · Gateway: {svc.gateway}</p>
      )}
      <button disabled={!svc || isPending} onClick={buy}>
        {isPending ? 'Confirm…' : 'Buy'}
      </button>
      {confirming && ' ⏳ waiting…'}
      {isSuccess && ' ✅ purchased'}
      {error && <span style={{color:'red'}}>Error: {error.message}</span>}

      {/* DISPUTE */}
      <h3 style={{marginTop:20}}>Raise dispute</h3>
      <input placeholder="Purchase ID" value={purId} onChange={e => setPurId(e.target.value)} />
      <button disabled={isPending} onClick={dispute}>
        {isPending ? 'Confirm…' : 'Dispute'}
      </button>
    </section>
  );
}