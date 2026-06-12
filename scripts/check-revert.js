import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

async function check() {
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const hash = "0x5aae87d7016d2cdb7233fdb7d3e83194292f2226f30188cb22a2d173dbaaf364";
        const receipt = await publicClient.getTransactionReceipt({ hash });
        console.log(`Status:`, receipt.status);
        console.log(`To:`, receipt.to);
        console.log(`From:`, receipt.from);
        
        // Also simulate the transaction to get the revert reason
        const tx = await publicClient.getTransaction({ hash });
        try {
            await publicClient.call({
                to: tx.to,
                data: tx.input,
                from: tx.from,
                value: tx.value,
                blockNumber: tx.blockNumber - 1n
            });
            console.log("Call succeeded (no revert reason)");
        } catch (e) {
            console.error("Revert Reason:", e.shortMessage || e.message);
        }
    } catch (e) {
        console.error(e);
    }
}
check();
