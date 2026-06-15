# Daily Grind

Daily Grind is an intent-based habit-tracking dApp built on Base Sepolia. It pairs decentralized crypto incentives with autonomous AI verification to help users stick to their goals.

## Smart Accounts Kit Usage

Since the Hackathon is focused on the Smart Accounts and Delegations, here are the links to our code usage:

### Advanced Permissions
*   **Requesting Advanced Permissions:** [useSmartAccount.tsx](./app/hooks/useSmartAccount.tsx) and [CreateGrindModal.tsx](./app/components/CreateGrindModal.tsx)
*   **Redeeming Advanced Permissions:** [useSmartAccount.tsx](./app/hooks/useSmartAccount.tsx)

### Delegations
*   **Create Delegation:** [useSmartAccount.tsx](./app/hooks/useSmartAccount.tsx)
*   **Redeeming Delegation:** [setup-1shot.js](./scripts/setup-1shot.js)

### Redelegation
*   **Creating redelegation:** Not currently implemented in this version.

### x402
*   Not currently implemented in this version.

## 1Shot API Usage

We used the 1Shot API for seamless on-chain execution for our autonomous agent when verifying and settling Grinds.
*   **Agent Execution & Resolving Grinds:** [route.ts](./app/api/resolve-grind/route.ts)
*   **Setup Script:** [setup-1shot.js](./scripts/setup-1shot.js)
*   **Testing Script:** [test-1shot.js](./scripts/test-1shot.js)

## Venice AI Usage

We utilized Venice AI as our autonomous oracle to visually verify user habit completion proofs in real-time.
*   **Image Verification API Route:** [route.ts](./app/api/verify-proof/route.ts)
*   **Testing Script:** [test-venice.js](./test-venice.js)

## Feedback

Building with the Smart Accounts Kit and 1Shot API was an incredible experience. The concept of advanced permissions and intent-based delegation completely transforms what is possible with Web3 dApps by removing friction for the end-user. 
The developer experience with 1Shot was buttery smooth. The only minor feedback is that finding comprehensive documentation and examples for some of the newer features (like x402) could be slightly improved, but the core tools worked flawlessly!

## Social Media

Check out our demo and project thread on X!
**[View our submission tweet here!](https://x.com/SOLANAdaddie/status/2066248799266165097)**
