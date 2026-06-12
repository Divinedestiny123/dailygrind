import { createClient } from '@supabase/supabase-js';
import { OneShotClient } from "@1shotapi/client-sdk";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ONESHOT_API_KEY = process.env.ONESHOT_API_KEY;
const ONESHOT_API_SECRET = process.env.ONESHOT_API_SECRET;
const ONESHOT_WALLET_ID = process.env.ONESHOT_WALLET_ID;
const ONESHOT_METHOD_ID = process.env.ONESHOT_METHOD_ID;

const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

if (!SUPABASE_URL || !SUPABASE_KEY || !ONESHOT_API_KEY || !ONESHOT_WALLET_ID || !ONESHOT_METHOD_ID) {
    console.error("❌ Missing required environment variables. Did you run setup-1shot.js?");
    process.exit(1);
}

// Initialize Clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const oneshot = new OneShotClient({ apiKey: ONESHOT_API_KEY, apiSecret: ONESHOT_API_SECRET });

console.log(`
=============================================
🤖 1SHOT KEEPER BOT INITIATED
=============================================
Server Wallet ID: ${ONESHOT_WALLET_ID}
Scanning every ${CHECK_INTERVAL_MS / 1000} seconds...
=============================================
`);

async function runKeeper() {
    try {
        console.log(`[${new Date().toISOString()}] Scanning active grinds...`);

        // 1. Fetch all active grinds
        const { data: grinds, error } = await supabase
            .from('grinds')
            .select('*')
            .eq('status', 'active');

        if (error) {
            console.error("❌ Supabase Error:", error.message);
            return;
        }

        if (!grinds || grinds.length === 0) {
            console.log("   No active grinds found. Safe.");
            return;
        }

        let slashedCount = 0;

        for (const grind of grinds) {
            const now = new Date().getTime();
            // Deadline is created_at + (streak + 1) * 24 hours
            const deadline = new Date(grind.created_at).getTime() + (grind.streak + 1) * 24 * 60 * 60 * 1000;

            if (now > deadline) {
                console.log(`\n⚠️ DEADLINE MISSED: User ${grind.user_address} (Grind: "${grind.task_name}")`);
                console.log(`   Initiating Trustless Slashing via 1Shot API...`);

                try {
                    // Convert penalty amount to 6 decimals (USDC string)
                    // We must pad with 6 zeros since 1Shot SDK execute parameters must be strings
                    const amountToResolve = (grind.penalty_amount * 1000000).toString();

                    // 2. Execute Smart Contract Slashing via 1Shot API Server Wallet
                    console.log(`   [1Shot] Executing resolveGrind on Base Sepolia...`);
                    const transaction = await oneshot.contractMethods.execute(
                        ONESHOT_METHOD_ID,
                        { 
                            user: grind.user_address, 
                            amount: amountToResolve, 
                            success: "false" 
                        },
                        { 
                            walletId: ONESHOT_WALLET_ID,
                            memo: `Auto-Slashing missed deadline for ${grind.user_address}`
                        }
                    );
                    
                    console.log(`   [1Shot] ✅ Transaction Sent! ID: ${transaction.id}`);

                    // 3. Update Database
                    console.log(`   [Database] Updating status to 'failed'...`);
                    const { error: updateError } = await supabase
                        .from('grinds')
                        .update({ status: 'failed' })
                        .eq('id', grind.id);

                    if (updateError) {
                        console.error(`   ❌ Database Update Failed:`, updateError.message);
                    } else {
                        console.log(`   [Database] ✅ Status Updated successfully.`);
                    }

                    slashedCount++;
                } catch (slashError) {
                    console.error(`   ❌ Failed to slash user ${grind.user_address}:`, slashError);
                }
            }
        }

        if (slashedCount === 0) {
            console.log("   All active grinds are within their deadlines. Safe.");
        } else {
            console.log(`\n✅ Keeper Run Complete: Slashed ${slashedCount} users.`);
        }

    } catch (err) {
        console.error("❌ Keeper execution failed:", err);
    }
}

// Run immediately, then loop
runKeeper();
setInterval(runKeeper, CHECK_INTERVAL_MS);
