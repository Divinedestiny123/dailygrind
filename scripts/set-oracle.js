import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const RPC_URL = "https://sepolia.base.org";
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const DEPLOYER_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY; // Assuming the old oracle was the deployer
const NEW_ORACLE = process.env.ONESHOT_WALLET_ADDRESS;

if (!VAULT_ADDRESS || !DEPLOYER_PRIVATE_KEY || !NEW_ORACLE) {
    console.error("❌ Missing environment variables. Ensure ONESHOT_WALLET_ADDRESS is in .env.local.");
    process.exit(1);
}

const abi = [
    "function setOracle(address _oracleSigner) external"
];

async function updateOracle() {
    console.log("Connecting to Base Sepolia...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    const vault = new ethers.Contract(VAULT_ADDRESS, abi, deployer);

    console.log(`Setting new Oracle Signer to 1Shot Wallet: ${NEW_ORACLE}`);
    try {
        const tx = await vault.setOracle(NEW_ORACLE);
        console.log(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();
        console.log("✅ Smart Contract Oracle updated successfully!");
    } catch (e) {
        console.error("❌ Failed to update Oracle:", e);
    }
}

updateOracle();
