import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OneShotClient } from '@1shotapi/client-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
    const ONESHOT_API_KEY = process.env.ONESHOT_API_KEY;
    const ONESHOT_API_SECRET = process.env.ONESHOT_API_SECRET;
    const BUSINESS_ID = process.env.ONESHOT_BUSINESS_ID;

    const oneshot = new OneShotClient({ apiKey: ONESHOT_API_KEY, apiSecret: ONESHOT_API_SECRET });

    // Directly use client.request to bypass SDK validation bugs
    try {
        const data = await oneshot.request("GET", `/business/${BUSINESS_ID}/transactions?pageSize=5`);
        const txs = data.response || [];
        
        for (const tx of txs) {
            console.log(`Tx: ${tx.id} | Status: ${tx.status} | Hash: ${tx.transactionHash}`);
            console.log(`Error:`, tx.errorData);
            console.log(`Args:`, JSON.stringify(tx.contractMethodArgs));
            console.log(`-----------------------------------`);
        }
    } catch (e) {
        console.error(e);
    }
}
check();
