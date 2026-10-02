'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useState } from 'react';
import { SiweMessage } from 'siwe';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      // 1. Get nonce from backend
      const res = await fetch('http://127.0.0.1:8000/api/auth/nonce');
      const { nonce } = await res.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the OnePiece Coin App.',
        uri: window.location.origin,
        version: '1',
        chainId: 97, // BSC Testnet
        nonce,
      });

      // 3. Sign message
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // 4. Verify signature on backend
      const verifyRes = await fetch('http://127.0.0.1:8000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: message.prepareMessage(),
          signature,
          wallet_address: address,
        }),
      });

      const data = await verifyRes.json();
      if (data.token) {
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        alert('Login successful!');
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      alert('Error signing in');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">OnePiece Coin (OPC)</h1>
      
      <div className="mb-8">
        <ConnectButton />
      </div>

      {isConnected && !user && (
        <button 
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Sign-In with Ethereum (SIWE)
        </button>
      )}

      {user && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl mb-4 text-green-400">Autentikasi Berhasil!</h2>
          <p className="mb-2"><strong>Wallet:</strong> {user.wallet_address}</p>
          <p><strong>User ID (Database):</strong> {user.id}</p>
        </div>
      )}
    </main>
  );
}
