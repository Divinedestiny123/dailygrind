import { OneShotClient } from "@1shotapi/client-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function setup() {
    const client = new OneShotClient({
        apiKey: process.env.ONESHOT_API_KEY,
        apiSecret: process.env.ONESHOT_API_SECRET,
    });
    
    console.log("Keys available on client:");
    console.log(Object.keys(client));
    
    try {
        // try to do a raw request to get businesses
        const res = await client.request("GET", "/businesses");
        console.log("Businesses:", res);
    } catch (e) {
        console.error("No businesses endpoint?", e.message);
    }
    
    try {
        // try to get current user
        const res = await client.request("GET", "/users/me");
        console.log("User:", res);
    } catch (e) {
        console.error("No users/me endpoint?", e.message);
    }
}
setup().then(() => process.exit(0));
