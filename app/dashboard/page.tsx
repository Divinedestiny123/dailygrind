"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSmartAccount } from '../hooks/useSmartAccount';
import CreateGrindModal from '../components/CreateGrindModal';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Grind = {
  id: string;
  task_name: string;
  streak: number;
  status: string;
  created_at: string;
  penalty_amount: number;
  duration: number;
};

// --- INTERACTIVE CARD ---
function InteractiveGrindCard({ grind, onProofVerified, onGrindDeleted, onGrindRevived, onGrindCompleted, onLog }: { grind: Grind, onProofVerified: (id: string) => void, onGrindDeleted: (id: string) => void, onGrindRevived: (id: string, newDate: string) => void, onGrindCompleted: (id: string) => void, onLog: (msg: string, type: string) => void }) {
  const { address, lockUSDCInVault } = useSmartAccount();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasIgnited, setHasIgnited] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("Loading...");
  const [isExpired, setIsExpired] = useState(false);
  const [isReviving, setIsReviving] = useState(false);

  useEffect(() => {
    // Calculate target deadline based on created_at and streak
    const targetDate = new Date(new Date(grind.created_at).getTime() + (grind.streak + 1) * 24 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      // Mathematically determine if the user has already ignited their streak for the current 24-hour cycle
      const nextCycleStart = new Date(grind.created_at).getTime() + grind.streak * 24 * 60 * 60 * 1000;
      setHasIgnited(now < nextCycleStart);

      if (diff <= 0) {
        setTimeLeft("00:00:00 - MISSED!");
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} remaining`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [grind.created_at, grind.streak]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    try {
      // Resize image on client to prevent 413 Payload Too Large errors for screenshots
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to highly compressed JPEG to fit in Next.js 1MB body limit
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(objectUrl);

        try {
          const res = await fetch('/api/verify-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskName: grind.task_name, imageBase64: base64, userAddress: address })
          });
          const data = await res.json();
          
          if (res.ok && data.verified) {
             setHasIgnited(true);
             const { error } = await supabase.from('grinds').update({ streak: grind.streak + 1 }).eq('id', grind.id);
             if (!error) {
                 onProofVerified(grind.id);
                 toast.success("Venice AI Verified your proof! Streak updated.");
             } else {
                 console.error("Failed to update streak:", error);
                 toast.error("Verified but failed to save to database");
             }
          } else {
             console.error("Verification failed:", data);
             toast.error(data.error || "Venice AI rejected the proof. Try a clearer image.");
          }
        } catch (fetchErr) {
          console.error(fetchErr);
          toast.error("Network error during verification");
        } finally {
          setIsVerifying(false);
        }
      };
      
      img.onerror = () => {
        toast.error("Failed to read image file");
        setIsVerifying(false);
      };
      
      img.src = objectUrl;
    } catch(err) {
      console.error(err);
      toast.error("Error processing image");
      setIsVerifying(false);
    }
    
    // Clear the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-bold text-lg text-gray-900 capitalize">{grind.task_name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Goal: {grind.duration} Days</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all duration-500 ${
          hasIgnited ? 'bg-orange-500 border-orange-400 text-white scale-110 shadow-lg shadow-orange-500/30' : 'bg-amber-50 border-amber-200 text-orange-600'
        }`}>
          <span className={`text-xl transition-transform duration-700 ${hasIgnited ? 'animate-bounce scale-125' : ''}`}>🔥</span>
          <span className="font-black text-lg tracking-tight font-mono">{grind.streak}</span>
        </div>
      </div>

      <div className="p-5 grow">
        <p className="text-sm text-gray-600 mb-5">Submit clear visual evidence of your task completion for Venice AI verification.</p>
        {isVerifying && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <span className="text-sm text-blue-800 font-medium">🤖 Venice AI analyzing proof...</span>
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {hasIgnited && !isVerifying && (
          <div className="relative bg-linear-to-r from-orange-500 to-red-600 border border-orange-400 rounded-xl p-4 text-white overflow-hidden shadow-inner animate-fade-in">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
            <div className="relative flex items-center gap-3">
              <span className="text-2xl animate-pulse">⚡</span>
              <div>
                <h4 className="font-bold text-sm">STREAK IGNITED!</h4>
                <p className="text-xs text-orange-100">Venice AI approved. Safe for 24 hours.</p>
              </div>
            </div>
          </div>
        )}
        {!isVerifying && !hasIgnited && (
          <div className={`bg-amber-50 border ${isExpired ? 'border-red-300' : 'border-amber-200'} rounded-xl p-4 flex items-center justify-between`}>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isExpired ? 'text-red-600' : 'text-amber-700'} block`}>
                {isExpired ? 'DEADLINE MISSED' : 'DEADLINE WRAP'}
              </span>
              <span className={`text-sm ${isExpired ? 'text-red-700' : 'text-amber-900'} font-bold font-mono`}>{timeLeft}</span>
            </div>
            {!isExpired && <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Risk Pool</span>
          <span className="text-sm font-extrabold text-red-600">{grind.penalty_amount}.00 USDC</span>
        </div>
        <div className="flex gap-2">
          {grind.status === 'completed' ? (
            <div className="w-full text-center py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200">
              Grind Completed ✓
            </div>
          ) : grind.status === 'failed' || grind.status === 'slashed' ? (
            <div className="w-full text-center py-2 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">
              Grind Failed ✗
            </div>
          ) : hasIgnited && grind.streak >= grind.duration ? (
            <button
              onClick={async () => {
                const toastId = toast.loading("Oracle verifying and returning funds...");
                try {
                  const res = await fetch('/api/resolve-grind', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grindId: grind.id, success: true })
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success("Success! USDC returned to your wallet.", { id: toastId });
                    onLog(`1Shot API: Relayer submitted Stake Claim. 1Shot Event ID: ${data.txId}`, 'success');
                    onLog(`Please allow 1-2 minutes for blockchain confirmation. Check your address on Base Sepolia Scan.`, 'info');
                    onGrindCompleted(grind.id);
                  } else {
                    toast.error(data.error || "Failed to resolve", { id: toastId });
                  }
                } catch (e) {
                  toast.error("Network error", { id: toastId });
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 transition-all"
            >
              Claim Stake
            </button>
          ) : isExpired && !hasIgnited ? (
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  const toastId = toast.loading("Oracle slashing funds to charity...");
                  try {
                    const res = await fetch('/api/resolve-grind', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ grindId: grind.id, success: false })
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success("Funds slashed. Grind ended.", { id: toastId });
                      onLog(`1Shot API: Relayer submitted Slash execution. 1Shot Event ID: ${data.txId}`, 'success');
                      onLog(`Check your wallet history on Base Sepolia Scan for the transaction.`, 'info');
                      onGrindDeleted(grind.id);
                    } else {
                      toast.error(data.error || "Failed to slash", { id: toastId });
                    }
                  } catch (e) {
                    toast.error("Network error", { id: toastId });
                  }
                }}
                className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition-all shadow-sm"
              >
                Give Up (Slash)
              </button>
              <button 
                disabled={isReviving}
                onClick={async () => {
                  if (!address) return;
                  setIsReviving(true);
                  try {
                    const res = await lockUSDCInVault(grind.penalty_amount, address);
                    if (res.success) {
                      const toastId = toast.loading("Reviving grind...");
                      // Backdate created_at so the math yields exactly 24 hours from NOW
                      const newCreatedAtTime = new Date().getTime() - grind.streak * 24 * 60 * 60 * 1000;
                      const newDate = new Date(newCreatedAtTime).toISOString();
                      
                      const { error } = await supabase.from('grinds').update({ 
                        created_at: newDate, 
                        status: 'active' 
                      }).eq('id', grind.id);

                      if (error) {
                        toast.error("Database error: " + error.message, { id: toastId });
                      } else {
                        toast.success("Grind revived! Your streak continues.", { id: toastId });
                        setIsExpired(false);
                        onGrindRevived(grind.id, newDate);
                      }
                    }
                  } finally {
                    setIsReviving(false);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow-sm transition-all ${
                  isReviving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {isReviving ? 'Approving...' : 'Stake & Revive'}
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleUploadClick}
                disabled={isVerifying || hasIgnited || isExpired}
                className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 shadow-sm cursor-pointer ${
                  hasIgnited ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                }`}
              >
                {isVerifying ? 'Verifying...' : hasIgnited ? 'Verified ✓' : 'Upload Proof'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myGrinds, setMyGrinds] = useState<Grind[]>(() => {
    // Try to load from cache instantly on mount
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('daily_grind_cache');
      if (cached) return JSON.parse(cached);
    }
    return [];
  });
  // If we already have cached data, don't show the initial loading spinner
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('daily_grind_cache');
    }
    return true;
  }); 
  const [oracularLogs, setOracularLogs] = useState<{message: string, type: string, timestamp: number}[]>([]);
  
  const { address, disconnectWallet } = useSmartAccount();

  // SECURE ROUTING & REAL-TIME ENGINE
  useEffect(() => {
    // 1. Kick them out if not connected
    if (!address) {
      router.push('/');
      return;
    }

    // 2. Normalize address to perfectly match database inserts
    const normalizedAddress = address.toLowerCase();

    // 3. Fetch initial data
    const fetchUserGrinds = async () => {
      const { data, error } = await supabase
        .from('grinds')
        .select('*')
        .eq('user_address', normalizedAddress)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Data fetch error:", error);
      } else if (data) {
        setMyGrinds(data);
        localStorage.setItem('daily_grind_cache', JSON.stringify(data));
      }
      setIsLoading(false);
    };

    fetchUserGrinds();

    // 4. Start Supabase Real-Time WebSocket Listener for Grinds
    const grindChannel = supabase
      .channel('realtime_grinds')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grinds', filter: `user_address=eq.${normalizedAddress}` }, 
        () => {
          console.log("Real-time update detected! Fetching fresh data...");
          fetchUserGrinds();
        }
      )
      .subscribe();

    // 5. Start Supabase Real-Time WebSocket Listener for Oracular Logs
    const logChannel = supabase
      .channel('oracular_logs')
      .on('broadcast', { event: 'log' }, (payload) => {
        setOracularLogs(prev => [{ ...payload.payload, timestamp: Date.now() }, ...prev].slice(0, 15));
      })
      .subscribe();

    // Cleanup listener on unmount
    return () => {
      supabase.removeChannel(grindChannel);
      supabase.removeChannel(logChannel);
    };
  }, [address, router]);

  const handleProofVerified = (grindId: string) => {
    // Optimistic UI update (Real-time will sync it permanently right after)
    setMyGrinds(prev => prev.map(g => g.id === grindId ? { ...g, streak: g.streak + 1 } : g));
  };

  const handleGrindDeleted = (grindId: string) => {
    setMyGrinds(prev => prev.filter(g => g.id !== grindId));
  };

  const handleGrindRevived = (grindId: string, newDate: string) => {
    setMyGrinds(prev => {
      const updated = prev.map(g => g.id === grindId ? { ...g, status: 'active', created_at: newDate } : g);
      localStorage.setItem('daily_grind_cache', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGrindCompleted = (grindId: string) => {
    setMyGrinds(prev => {
      const updated = prev.map(g => g.id === grindId ? { ...g, status: 'completed' } : g);
      localStorage.setItem('daily_grind_cache', JSON.stringify(updated));
      return updated;
    });
  };

  const totalStaked = myGrinds.reduce((sum, grind) => sum + Number(grind.penalty_amount), 0);
  const highestStreak = myGrinds.length > 0 ? Math.max(...myGrinds.map(g => g.streak)) : 0;

  const filteredGrinds = myGrinds.filter(g => {
    if (activeTab === 'all') return true;
    const isExpired = (new Date(new Date(g.created_at).getTime() + (g.streak + 1) * 24 * 60 * 60 * 1000).getTime() - new Date().getTime()) <= 0;
    if (activeTab === 'active') return !isExpired && g.status !== 'completed';
    if (activeTab === 'completed') return isExpired || g.status === 'completed';
    return true;
  });

  // Wait to render until authentication routing decides where they go
  if (!address) return null; 

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8 relative">
      
      <CreateGrindModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userAddress={address} 
      />

      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Grind</h1>
          <p className="text-gray-500 mt-1">Don&apos;t break the chain. Venice AI is watching.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3 items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200 text-sm font-mono text-gray-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
              <button 
                onClick={() => {
                  disconnectWallet(); 
                  router.push('/');   
                }}
                className="text-[11px] font-medium text-gray-400 hover:text-red-500 mt-1 transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-medium transition cursor-pointer h-9.5 self-start"
            >
              + Create Grind
            </button>
          </div>
        </div>
      </header>

      {/* ANALYTICS STRIP */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total At Stake</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalStaked}.00 <span className="text-sm font-medium text-gray-500">USDC</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Highest Streak</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{highestStreak} <span className="text-sm font-medium text-gray-500">Days</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Grinds</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{myGrinds.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Slashed Penalty</p>
          <p className="text-2xl font-bold text-red-600 mt-1">0.00 <span className="text-sm font-medium text-gray-500">USDC</span></p>
        </div>
      </section>

      {/* MAIN CONTENT SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER TWO COLUMNS */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex border-b border-gray-200">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-4 font-medium text-sm border-b-2 capitalize transition cursor-pointer ${
                  activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} Grinds
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 p-10 text-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredGrinds.length === 0 ? (
              <div className="col-span-2 p-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500 mb-4">No {activeTab} Grinds found.</p>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium cursor-pointer shadow-md hover:bg-gray-800 transition">Create your first Grind</button>
              </div>
            ) : (
              filteredGrinds.map((grind) => (
                <InteractiveGrindCard 
                  key={grind.id} 
                  grind={grind} 
                  onProofVerified={handleProofVerified} 
                  onGrindDeleted={handleGrindDeleted}
                  onGrindRevived={handleGrindRevived}
                  onGrindCompleted={handleGrindCompleted}
                  onLog={(msg, type) => setOracularLogs(prev => [{ message: msg, type, timestamp: Date.now() }, ...prev].slice(0, 15))}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTION LOG */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs h-fit sticky top-6">
          <h3 className="font-bold text-lg mb-1">Oracular Execution Log</h3>
          <p className="text-xs text-gray-400 mb-6">Real-time validation events handled by Venice AI.</p>
          <div className="relative border-l border-gray-200 pl-4 space-y-6 font-sans mt-6">
            <div className="relative">
              <span className="absolute -left-5.25 top-1 bg-green-500 h-2.5 w-2.5 rounded-full ring-4 ring-white"></span>
              <p className="text-xs font-mono text-gray-400">LIVE SYSTEM</p>
              <h4 className="text-sm font-semibold text-gray-800 mt-0.5">Monitoring Vault Deployments</h4>
              <p className="text-xs text-gray-500 mt-1">Awaiting proof uploads. Active Smart Contract stakes are securely locked on Base Sepolia.</p>
            </div>
            
            {oracularLogs.map((log, i) => (
              <div key={i} className="relative animate-fade-in">
                <span className={`absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${log.type === 'error' ? 'bg-red-500' : log.type === 'success' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                <p className="text-xs font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                <h4 className={`text-sm font-semibold mt-0.5 ${log.type === 'error' ? 'text-red-700' : log.type === 'success' ? 'text-blue-700' : 'text-gray-800'}`}>{log.message}</h4>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}