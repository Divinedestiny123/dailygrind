import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

async function check() {
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const address = "0x4e6961C262E5D40B0d7E99f9564d5566A76708b9";
        const balance = await publicClient.getBalance({ address });
        console.log(`Balance of Oracle Wallet ${address}: ${formatEther(balance)} ETH`);
    } catch (e) {
        console.error(e);
    }
}
check();
