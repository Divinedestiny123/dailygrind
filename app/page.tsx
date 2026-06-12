"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSmartAccount } from './hooks/useSmartAccount';

export default function LandingPage() {
  const router = useRouter();
  const { address, isConnecting, connectWallet } = useSmartAccount();

  // Secure routing boundary: Send user to app if wallet state hydrates positively
  useEffect(() => {
    if (address) {
      router.push('/dashboard');
    }
  }, [address, router]);

  // BULLETPROOF SCROLL LOGIC: Calculates exact offset for the sticky header
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Height of the sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* 1. AMBIENT ATMOSPHERIC BACKGROUND RADIALS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[10%] w-125 h-125 bg-blue-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[5%] w-150 h-150 bg-orange-500/10 rounded-full blur-[160px]"></div>
        <div className="absolute top-[60%] left-1/3 w-100 h-100 bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* 2. STICKY GLASSMORPHIC HEADER */}
      <header className="sticky top-0 w-full backdrop-blur-md bg-gray-950/70 border-b border-gray-900 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <span className="text-2xl animate-pulse">🔥</span> Daily Grind
          </div>
          
          {/* SMOOTH SECTION JUMP LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('architecture')} className="hover:text-white transition cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('economics')} className="hover:text-white transition cursor-pointer">Stake Mechanics</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition cursor-pointer">About Us</button>
          </nav>

          <div>
            {/* UPDATED: Text changed to 'Connect Wallet' */}
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-xs hover:scale-103 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SUITE SECTION */}
      <section id="hero" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
          Engineered for Base Sepolia Hackathon
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15] max-w-5xl">
          Commit with your signature.<br className="hidden sm:inline"/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Validate with Autonomous AI.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Daily Grind pairs advanced intent delegation models with distributed cryptographic execution. Secure your daily milestones via EIP-712 structured data grants, let Venice AI pass oracular verdicts on uploaded verification metrics, and keep your stakes locked in programmatic alignment.
        </p>

        {/* UPDATED: Resized Hero buttons (px-6 py-3 text-base) */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/20 hover:scale-103 active:scale-98 transition-all cursor-pointer"
          >
            {isConnecting ? 'Authorizing Extensions...' : 'Connect Wallet to Enter'}
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl font-semibold text-base hover:bg-gray-800 transition-all cursor-pointer"
          >
            Explore System
          </button>
        </div>
      </section>

      {/* 4. VALUES & CORE FEATURES SECTION */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-500">Decentralized Execution Layer</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">Architected to solve human inconsistency.</p>
          <p className="text-gray-400 mt-4">By shifting traditional behavioral mechanisms directly onto immutable ledgers, we establish structural guardrails that optimize personal growth loops.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900/40 border border-gray-900 p-8 rounded-2xl backdrop-blur-xs">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl font-bold mb-6">✍️</div>
            <h3 className="text-xl font-bold mb-3">EIP-712 Intent Grants</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Sign secure, human-readable cryptographic allowances without burning native network gas. Grant systemic clearance for programmatic slashing constraints bound explicitly to fulfillment schedules.</p>
          </div>

          <div className="bg-gray-900/40 border border-gray-900 p-8 rounded-2xl backdrop-blur-xs">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl font-bold mb-6">🤖</div>
            <h3 className="text-xl font-bold mb-3">Venice AI Verification</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Avoid centralized multi-sig dependency or human manual auditing pools. Venice AI serves as an absolute, objective sovereign parser, auditing proof streams for deterministic authenticity validation.</p>
          </div>

          <div className="bg-gray-900/40 border border-gray-900 p-8 rounded-2xl backdrop-blur-xs">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold mb-6">🔥</div>
            <h3 className="text-xl font-bold mb-3">Snapchat Streak Loops</h3>
            <p className="text-xs uppercase tracking-wider bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md font-semibold w-fit mb-3">High Engagement</p>
            <p className="text-gray-400 text-sm leading-relaxed">Leverage core psychological triggers. Combined with the immediate visual threat of risk-pool slashing, the persistent activation footprint turns structural performance targets into a competitive matrix.</p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ARCHITECTURE / TECHNICAL DRILL DOWN */}
      <section id="architecture" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-900 bg-gray-950/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-400">System Flow Diagram</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">The Oracular Verification Sequence</p>
            
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <span className="flex-none h-8 w-8 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono font-bold flex items-center justify-center text-gray-400">01</span>
                <div>
                  <h4 className="font-bold text-base text-white">Cryptographic Vault Lock</h4>
                  <p className="text-sm text-gray-400 mt-1">Configure habit profiles and define penalty ranges. Establish target values via your secure signature token to validate the active operational framework parameters.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-none h-8 w-8 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono font-bold flex items-center justify-center text-gray-400">02</span>
                <div>
                  <h4 className="font-bold text-base text-white">Deterministic Proof Processing</h4>
                  <p className="text-sm text-gray-400 mt-1">Users upload daily performance evidence (visual workspace states, metrics, code manifests) which get converted directly to decentralized content registries.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex-none h-8 w-8 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono font-bold flex items-center justify-center text-gray-400">03</span>
                <div>
                  <h4 className="font-bold text-base text-white">Sovereign Oracle Assessment</h4>
                  <p className="text-sm text-gray-400 mt-1">Venice AI assesses data properties, confirming authenticity loops. Success conditions scale active streaks; failures instantly trigger delegation execution to claim penalties.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CODE / TECHNICAL GRAPHICS CONTAINER */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-900 p-6 font-mono text-xs text-gray-400 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500/70"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/70"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/70"></div>
              <span className="text-gray-500 ml-2 text-[11px]">VeniceVerificationOracle.sol</span>
            </div>
            <p className="text-blue-400">{"// Cryptographic Permission Context Map"}</p>
            <p className="mt-2"><span className="text-purple-400">struct</span> <span className="text-yellow-400">GrindAllocation</span> &#123;</p>
            <p className="pl-4">address <span className="text-emerald-400">userWallet</span>;</p>
            <p className="pl-4">uint256 <span className="text-emerald-400">dailyAllowanceUSDC</span>;</p>
            <p className="pl-4">bytes32 <span className="text-emerald-400">eip712SignatureHash</span>;</p>
            <p className="pl-4">uint256 <span className="text-emerald-400">activeConsecutiveStreaks</span>;</p>
            <p className="pl-4">bool <span className="text-emerald-400">isSlashedStateActive</span>;</p>
            <p className="">&125;</p>
            <p className="mt-4 text-purple-400">function <span className="text-yellow-400">executeOracularVerdict</span>(<span className="text-gray-300">bytes32 verificationId, bool isVerified</span>) external &#123;</p>
            <p className="pl-4 text-gray-500">require(msg.sender == veniceAIOracleAgent, &quot;Unauthorized&quot;);</p>
            <p className="pl-4 text-purple-400">if <span className="text-gray-400">(!isVerified)</span> &#123;</p>
            <p className="pl-8 text-red-400">triggerAutomatedSlashing(verificationId);</p>
            <p className="pl-4">&#125; <span className="text-purple-400">else</span> &#123;</p>
            <p className="pl-8 text-emerald-400">incrementStreakFootprint(verificationId);</p>
            <p className="pl-4">&#125;</p>
            <p className="">&#125;</p>
          </div>
        </div>
      </section>

      {/* 6. ECONOMIC ARCHITECTURE / STAKE MODEL */}
      <section id="economics" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-orange-500">Risk Allocation Framework</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">High-Stakes Yield Mechanics</p>
          <p className="text-gray-400 mt-4">Our system operates under strict game-theoretic balance models. Locked allowances form continuous accountability channels optimized directly via programmatic distribution networks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-2xl bg-linear-to-b from-gray-900/60 to-gray-900/10 border border-gray-900">
            <h4 className="text-lg font-bold text-white mb-2">The Accountability Pool</h4>
            <p className="text-sm text-gray-400 leading-relaxed">When users execute EIP-712 structured records, their USDC targets remain completely in their own custodian systems until a daily milestone interval lapses. There are no initial upfront out-of-pocket costs — simply dynamic parameters governing asset state transitions based entirely on behavioral performance outcomes.</p>
          </div>

          <div className="p-8 rounded-2xl bg-linear-to-b from-gray-900/60 to-gray-900/10 border border-gray-900">
            <h4 className="text-lg font-bold text-white mb-2">Where do slashed penalties go?</h4>
            <p className="text-sm text-gray-400 leading-relaxed">To incentivize total network consistency loop expansion, slashed USDC properties do not sit inside stagnant treasury frameworks. Instead, assets are automatically routed directly to fund decentralized application infrastructure deployment rewards and network-wide validator validation gas pools on the Base network layer.</p>
          </div>
        </div>
      </section>

      {/* 7. ABOUT US / MISSION SUITE */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-900 bg-linear-to-b from-gray-950 to-gray-900/40 rounded-3xl mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">Our Paradigm Statement</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-6">Built by Developers, for Global High-Grind Teams.</p>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
            Daily Grind was forged to replace trust-based manual systems with absolute mathematical execution. We believe that human evolution scales rapidly when computational frameworks eliminate self-deception loops. By anchoring decentralized tracking arrays straight onto Base infrastructure, we provide open-source tools that ensure consistency across global development nodes, startup engineering sprint operations, and autonomous contributors.
          </p>
          
          <div className="inline-flex flex-wrap justify-center items-center gap-4 text-sm font-semibold text-gray-500">
            <span>🚀 Hyper-Speed Execution on Base</span>
            <span className="text-gray-800">•</span>
            <span>🔒 Cryptographically Sovereign Architecture</span>
            <span className="text-gray-800">•</span>
            <span>💡 Open-Incentive Alignment Matrix</span>
          </div>
        </div>
      </section>

      {/* 8. CORE SYSTEM FOOTER */}
      <footer className="border-t border-gray-900 py-12 text-center text-xs text-gray-500 z-10 relative bg-gray-950">
        <p>&copy; {new Date().getFullYear()} Daily Grind Ecosystem. Built globally for the Web3 Frontier. All Rights Reserved.</p>
      </footer>

    </div>
  );
}