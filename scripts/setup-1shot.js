import { OneShotClient } from "@1shotapi/client-sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const BUSINESS_ID = "19ff530a-1928-42c6-98a4-d3d42310b8df";
const CHAIN_ID = 84532; // Base Sepolia

async function setup() {
    try {
        console.log("🚀 Initializing 1Shot Client...");
        const client = new OneShotClient({
            apiKey: process.env.ONESHOT_API_KEY,
            apiSecret: process.env.ONESHOT_API_SECRET,
        });

        // 1. Fetch Existing Server Wallet
        console.log("💼 Fetching existing Server Wallet...");
        const walletsList = await client.wallets.list(BUSINESS_ID, { pageSize: 1 });
        
        if (walletsList.response.length === 0) {
            console.error("❌ No existing wallets found. Please create one in the dashboard.");
            process.exit(1);
        }

        const wallet = walletsList.response[0];
        console.log(`✅ Existing Wallet Found!`);
        console.log(`   Wallet ID: ${wallet.id}`);
        console.log(`   Address: ${wallet.accountAddress}`);

        // 2. Create Contract Method
        console.log("\n📜 Registering Smart Contract Method...");
        const method = await client.contractMethods.create(BUSINESS_ID, {
            chainId: CHAIN_ID,
            contractAddress: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
            walletId: wallet.id,
            name: "Resolve Grind",
            description: "Oracle resolving a grind on Base Sepolia",
            functionName: "resolveGrind",
            stateMutability: "nonpayable",
            inputs: [
                { name: "user", type: "address", index: 0 },
                { name: "amount", type: "uint", typeSize: 256, index: 1 },
                { name: "success", type: "bool", index: 2 }
            ],
            outputs: [],
        });
        console.log(`✅ Contract Method Registered!`);
        console.log(`   Method ID: ${method.id}`);

        // 3. Save to .env.local
        console.log("\n💾 Saving IDs to .env.local...");
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Append if not exists
        if (!envContent.includes("ONESHOT_WALLET_ID")) {
            envContent += `\nONESHOT_BUSINESS_ID=${BUSINESS_ID}`;
            envContent += `\nONESHOT_WALLET_ID=${wallet.id}`;
            envContent += `\nONESHOT_METHOD_ID=${method.id}`;
            envContent += `\nONESHOT_WALLET_ADDRESS=${wallet.accountAddress}\n`;
            fs.writeFileSync(envPath, envContent);
            console.log("✅ .env.local updated successfully!");
        } else {
            console.log("⚠️ Variables already exist in .env.local. Skipping append.");
        }

        console.log("\n🎉 Setup Complete! Next step: Give this Server Wallet permissions in the Smart Contract.");

    } catch (error) {
        console.error("❌ Setup Failed:", error);
    }
}

setup();
