<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use kornrunner\Keccak;
use Elliptic\EC;

class AuthController extends Controller
{
    public function nonce(Request $request)
    {
        $nonce = Str::random(32);
        
        return response()->json(['nonce' => $nonce]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'signature' => 'required|string',
            'wallet_address' => 'required|string',
        ]);

        $message = $request->message;
        $signature = $request->signature;
        $address = strtolower($request->wallet_address);

        $recoveredAddress = $this->recoverAddress($message, $signature);

        if (strtolower($recoveredAddress) !== $address) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Signature is valid. Find or create user.
        $user = User::firstOrCreate(
            ['wallet_address' => $address],
            ['nonce' => Str::random(32)]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    private function recoverAddress($message, $signature)
    {
        try {
            $messageLength = strlen($message);
            $hash = Keccak::hash("\x19Ethereum Signed Message:\n{$messageLength}{$message}", 256);
            $sign = [
                'r' => substr($signature, 2, 64),
                's' => substr($signature, 66, 64)
            ];
            
            $v = hexdec(substr($signature, 130, 2));
            if ($v >= 27) {
                $recId = $v - 27;
            } else {
                $recId = $v;
            }
            
            $ec = new EC('secp256k1');
            $pubkey = $ec->recoverPubKey($hash, $sign, $recId);
            
            $derivedAddress = '0x' . substr(Keccak::hash(substr(hex2bin($pubkey->encode('hex')), 1), 256), 24);
            
            return $derivedAddress;
        } catch (\Exception $e) {
            return false;
        }
    }
}
