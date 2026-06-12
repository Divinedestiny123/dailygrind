import React, { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function CreateGrindModal({ 
  isOpen, 
  onClose,
  userAddress 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  userAddress: string | null; 
}) {
  // UPDATED: Destructure the new lockUSDCInVault function
  const { lockUSDCInVault, isGranting } = useSmartAccount();
  const [taskName, setTaskName] = useState('');
  const [stake, setStake] = useState(5);
  const [duration, setDuration] = useState(30);

  if (!isOpen) return null;

  const handleLockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAddress) {
      toast.error("Please connect your wallet first!");
      return;
    }

    const loadingToast = toast.loading("Awaiting blockchain transaction...");
    
    try {
      // Execute the On-Chain Transfer
      const result = await lockUSDCInVault(stake, userAddress);
      toast.dismiss(loadingToast);
      
      if (result.success && result.txHash) {
        const loadingDb = toast.loading("Transaction successful! Saving to Dashboard...");
        
        const normalizedAddress = userAddress.toLowerCase();

        const { error } = await supabase
          .from('grinds')
          .insert([
            {
              user_address: normalizedAddress,
              task_name: taskName,
              penalty_amount: stake,
              duration: duration,
              // We save the actual Blockchain TxHash into the database now!
              erc7715_permission_context: result.txHash
            }
          ]);

        toast.dismiss(loadingDb);

        if (error) {
          console.error("SUPABASE ERROR:", error);
          toast.error(`Database Error: ${error.message}`);
        } else {
          // You can actually check this hash on Basescan!
          toast.success("Grind Locked! USDC Secured in Vault.");
          setTaskName('');
          onClose();
        }
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-xl">Create New Grind</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 font-bold text-xl px-2">&times;</button>
        </div>

        <form onSubmit={handleLockIn} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What is your daily habit?</label>
            <input 
              type="text" 
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Code for 1 hour, Read 10 pages..." 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Goal Duration (Days)</label>
            <input 
              type="number" 
              min="1"
              required
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Penalty Stake (USDC)</label>
            <div className="relative">
              <input 
                type="number" 
                min="1"
                required
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <span className="absolute left-3 top-3.5 text-gray-500 font-bold">$</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This amount will be locked into the Smart Contract Vault right now. If you complete your streak, you earn it back.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isGranting || !taskName}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all ${
              isGranting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isGranting ? 'Confirming Transaction...' : 'Lock It In On-Chain'}
          </button>
        </form>
      </div>
    </div>
  );
}