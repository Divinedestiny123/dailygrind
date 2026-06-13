import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { taskName, imageBase64, userAddress } = await req.json();

        if (!taskName || !imageBase64) {
            return NextResponse.json({ error: "Missing taskName or image" }, { status: 400 });
        }

        const apiKey = process.env.VENICE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Venice API Key not configured" }, { status: 500 });
        }

        // Broadcast: Verification Started
        try {
            await supabase.channel('oracular_logs').send({
                type: 'broadcast',
                event: 'log',
                payload: { message: `Started verification for task: "${taskName}"`, type: 'info' }
            });
        } catch (e) {
            console.error("Broadcast failed:", e);
        }

        const MAX_RETRIES = 3;
        let response: Response | undefined;
        let retryCount = 0;

        while (retryCount < MAX_RETRIES) {
            response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "qwen3-vl-235b-a22b",
                    messages: [
                        {
                            role: "system",
                            content: "You are an objective and lenient verification oracle. You analyze images to verify if a user completed their task. Respond with EXACTLY 'TRUE' if the image could plausibly show ANY proof related to the task, or 'FALSE' if it is completely unrelated or empty. Do not include any other text or punctuation. Give the user the benefit of the doubt."
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Does this image show plausible proof of the task: '${taskName}'?`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: imageBase64
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            if (response.ok) {
                break;
            }

            const errorData = await response.text();
            console.error(`Venice API Error (Attempt ${retryCount + 1}):`, errorData);

            if (response.status === 429 || response.status >= 500) {
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential-ish backoff
                    continue;
                }
            }

            // If we run out of retries or hit a 400 error
            try {
                await supabase.channel('oracular_logs').send({
                    type: 'broadcast',
                    event: 'log',
                    payload: { message: `Verification failed: Venice API Error`, type: 'error' }
                });
            } catch (e) { console.error(e); }

            return NextResponse.json({ error: "Failed to verify with Venice AI after multiple attempts." }, { status: response.status });
        }

        if (!response) {
            return NextResponse.json({ error: "Failed to connect to Venice AI" }, { status: 500 });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim().toUpperCase();
        console.log(`[VENICE AI RESPONSE] for ${taskName}: ${content}`);

        const verified = content === 'TRUE' || content?.includes('TRUE');
        // Broadcast result
        try {
            await supabase.channel('oracular_logs').send({
                type: 'broadcast',
                event: 'log',
                payload: { 
                    message: `Task "${taskName}" was ${verified ? 'APPROVED' : 'REJECTED'} by Venice AI.`, 
                    type: verified ? 'success' : 'error' 
                }
            });
        } catch (e) { console.error(e); }

        return NextResponse.json({ verified, raw: content });
    } catch (error: any) {
        console.error("Verification API Error:", error);
        return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
    }
}
