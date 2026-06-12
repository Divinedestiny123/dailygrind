import { NextResponse } from 'next/server';
import { OneShotClient } from '@1shotapi/client-sdk';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { grindId, success } = await req.json();

        if (!grindId) {
            return NextResponse.json({ error: "Missing grindId" }, { status: 400 });
        }

        // 1. Fetch grind from Supabase
        const { data: grind, error: fetchError } = await supabase
            .from('grinds')
            .select('*')
            .eq('id', grindId)
            .single();

        if (fetchError || !grind) {
            return NextResponse.json({ error: "Grind not found" }, { status: 404 });
        }

        if (grind.status === 'completed' || grind.status === 'failed') {
            return NextResponse.json({ error: "Grind already resolved" }, { status: 400 });
        }

        // 2. Setup 1Shot API
        const ONESHOT_API_KEY = process.env.ONESHOT_API_KEY;
        const ONESHOT_API_SECRET = process.env.ONESHOT_API_SECRET;
        const ONESHOT_WALLET_ID = process.env.ONESHOT_WALLET_ID;
        const ONESHOT_METHOD_ID = process.env.ONESHOT_METHOD_ID;

        if (!ONESHOT_API_KEY || !ONESHOT_WALLET_ID || !ONESHOT_METHOD_ID) {
            return NextResponse.json({ error: "1Shot SDK not fully configured in env" }, { status: 500 });
        }

        const oneshot = new OneShotClient({ apiKey: ONESHOT_API_KEY, apiSecret: ONESHOT_API_SECRET! });

        // 3. Call Smart Contract via 1Shot API Server Wallet
        const amountToResolve = (grind.penalty_amount * 1000000).toString(); // 6 decimals
        
        // IMPORTANT: Checksum the user address, as some relayers reject lowercase addresses!
        const { getAddress } = await import('viem');
        const checksummedUserAddress = getAddress(grind.user_address);
        
        console.log(`[1Shot] Oracle resolving grind for ${checksummedUserAddress}, success: ${success}`);
        
        const transaction = await oneshot.contractMethods.execute(
            ONESHOT_METHOD_ID,
            { 
                user: checksummedUserAddress, 
                amount: amountToResolve, 
                success: success ? "true" : "false" 
            },
            { 
                walletId: ONESHOT_WALLET_ID,
                memo: `User ${success ? "claimed" : "slashed"} for grind ${grind.id}`
            }
        );

        // 4. Update Supabase status
        const newStatus = success ? 'completed' : 'failed';
        await supabase
            .from('grinds')
            .update({ status: newStatus })
            .eq('id', grindId);

        return NextResponse.json({ success: true, txId: transaction.id });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
