import { OneShotClient } from '@1shotapi/client-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
    const ONESHOT_API_KEY = process.env.ONESHOT_API_KEY;
    const ONESHOT_API_SECRET = process.env.ONESHOT_API_SECRET;
    const ONESHOT_METHOD_ID = process.env.ONESHOT_METHOD_ID;
    const ONESHOT_WALLET_ID = process.env.ONESHOT_WALLET_ID;

    const oneshot = new OneShotClient({ apiKey: ONESHOT_API_KEY, apiSecret: ONESHOT_API_SECRET });

    try {
        const transaction = await oneshot.contractMethods.execute(
            ONESHOT_METHOD_ID,
            { 
                user: "0x77b328df6b0649c0cda166e5dddde7cac029d44d", 
                amount: "0", 
                success: "true" 
            },
            { 
                walletId: ONESHOT_WALLET_ID,
                memo: `Test execution`
            }
        );
        console.log(`Executed. ID: ${transaction.id}`);
        console.log(`Hash: ${transaction.transactionHash}`);
        console.log(`Status: ${transaction.status}`);
    } catch (e) {
        console.error(e);
    }
}
check();
