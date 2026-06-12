import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

const vaultAbi = [
  { type: "function", name: "deposits", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "oracleSigner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "charityAddress", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
];

async function check() {
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const oracle = await publicClient.readContract({
            address: VAULT_ADDRESS,
            abi: vaultAbi,
            functionName: 'oracleSigner'
        });
        console.log("Vault Oracle Signer:", oracle);

        const oneshotWallet = process.env.ONESHOT_WALLET_ADDRESS;
        console.log("Expected 1Shot Wallet:", oneshotWallet);

        if (oracle.toLowerCase() !== oneshotWallet.toLowerCase()) {
            console.log("⚠️ Oracle mismatch! The smart contract oracle is not the 1Shot wallet!");
        }

        // Just check the deployer's address or a few known ones
        const userAddress = "0x3D0FB447E3a2E2fd2c5088acFfCCEa1aF5441794"; // the one from logs
        const deposit = await publicClient.readContract({
            address: VAULT_ADDRESS,
            abi: vaultAbi,
            functionName: 'deposits',
            args: [userAddress]
        });
        console.log(`Deposit for ${userAddress}:`, deposit.toString());

    } catch (e) {
        console.error(e);
    }
}
check();
