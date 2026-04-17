import React, { useState } from 'react';
import { X, Loader2, Music, Video, BellRing, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CreateReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (releaseId: string) => void;
}

export const CreateReleaseModal: React.FC<CreateReleaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'audio' | 'video' | 'ringtone'>('audio');
  const [genre, setGenre] = useState<'any' | 'western_classic' | 'jazz'>('any');
  const [title, setTitle] = useState('');
  const [containsExistingTrack, setContainsExistingTrack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken } = useAuth();

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ type, genre, title, containsExistingTrack })
      });
      
      if (!response.ok) throw new Error('Failed to create release');
      
      const data = await response.json();
      onSuccess(data.id);
      onClose();
      // Reset state
      setStep(1);
      setTitle('');
    } catch (err) {
      console.error(err);
      alert('Error creating release');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && type !== 'audio') {
      setStep(3); // Skip genre for non-audio
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 3 && type !== 'audio') {
      setStep(1);
    } else {
      setStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1976D2] flex items-center justify-center font-bold">
               {step}/3
             </div>
             <h3 className="text-xl font-bold text-gray-800">
               {step === 1 && "New release"}
               {step === 2 && `New ${type} release`}
               {step === 3 && `New ${type} release`}
             </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <p className="text-gray-600 font-medium">What is the type of your new release?</p>
                <div className="space-y-3">
                  {[
                    { id: 'audio', icon: <Music />, label: 'Audio' },
                    { id: 'video', icon: <Video />, label: 'Video' },
                    { id: 'ringtone', icon: <BellRing />, label: 'Ringtone' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setType(opt.id as any)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                        type === opt.id 
                          ? "border-[#1976D2] bg-blue-50 text-[#1976D2]" 
                          : "border-gray-100 hover:border-gray-200 text-gray-500"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        type === opt.id ? "bg-[#1976D2] text-white" : "bg-gray-100 text-gray-400"
                      )}>
                        {opt.icon}
                      </div>
                      <span className="font-bold uppercase tracking-wide">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <p className="text-gray-600 font-medium">What is the genre of your new {type} release?</p>
                  <p className="text-xs text-[#1976D2] bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    Releases of Western Classical or Jazz genre require different informations
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'any', label: 'Any genre' },
                    { id: 'western_classic', label: 'Western classical' },
                    { id: 'jazz', label: 'Jazz' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGenre(opt.id as any)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                        genre === opt.id 
                          ? "border-[#1976D2] bg-blue-50 text-[#1976D2]" 
                          : "border-gray-100 hover:border-gray-200 text-gray-500"
                      )}
                    >
                      <span className="font-bold uppercase tracking-wide">{opt.label}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        genre === opt.id ? "border-[#1976D2]" : "border-gray-300"
                      )}>
                        {genre === opt.id && <div className="w-2.5 h-2.5 bg-[#1976D2] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-gray-600 font-medium mb-3">What is the title of your new release?</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Fill in your release title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:bg-white transition-all text-lg"
                  />
                </div>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1976D2] focus:ring-[#1976D2]"
                    checked={containsExistingTrack}
                    onChange={(e) => setContainsExistingTrack(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Contains at least one track already existing within my catalog
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button
            onClick={step === 1 ? onClose : prevStep}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 transition-colors flex items-center gap-2"
          >
            {step > 1 && <ChevronLeft size={16} />}
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            disabled={step === 3 && (!title || isSubmitting)}
            onClick={step === 3 ? handleCreate : nextStep}
            className="px-8 py-2.5 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {step === 3 ? 'Create' : 'Next'}
                {step < 3 && <ChevronRight size={16} />}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
