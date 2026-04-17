import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Copy, RefreshCw, Check, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PromotionKitProps {
  releaseTitle: string;
  artistName: string;
  genre: string;
}

export const PromotionKit: React.FC<PromotionKitProps> = ({ releaseTitle, artistName, genre }) => {
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<{ captions: string[]; hashtags: string[]; bio: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateKit = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const prompt = `Generate a social media promotion kit for a music release.
      Release Title: ${releaseTitle}
      Artist: ${artistName}
      Genre: ${genre}
      
      Provide:
      1. Three catchy social media captions (one for Instagram, one for Twitter, one for Facebook).
      2. Five relevant hashtags.
      3. A short, professional bio for the release (max 2-3 sentences).
      
      Return the result as a raw JSON object with this structure:
      {
        "captions": ["caption1", "caption2", "caption3"],
        "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
        "bio": "short bio text"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        setKit(JSON.parse(text));
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
       {!kit && !loading && (
         <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 border-2 border-dashed border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-blue-50 text-[#1976D2] rounded-2xl flex items-center justify-center">
               <Sparkles size={32} />
            </div>
            <div className="space-y-2">
               <h4 className="text-xl font-bold text-gray-800">AI Promotion Kit</h4>
               <p className="text-gray-500 max-w-sm">Generate professional social media content and a release bio in seconds using AI.</p>
            </div>
            <button 
              onClick={generateKit}
              className="px-8 py-3 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            >
               <Sparkles size={20} />
               Generate Kit
            </button>
         </div>
       )}

       {loading && (
         <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={48} className="text-[#1976D2] animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Crafting your promotion kit...</p>
         </div>
       )}

       {kit && (
         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
               <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={24} className="text-[#1976D2]" />
                  Your AI Promotion Kit
               </h4>
               <button 
                 onClick={generateKit}
                 className="p-2 text-gray-400 hover:text-[#1976D2] transition-colors"
                 title="Regenerate"
               >
                  <RefreshCw size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Social Media Captions</h5>
                  {kit.captions.map((caption, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                       <p className="text-sm text-gray-700 leading-relaxed pr-8">{caption}</p>
                       <button 
                         onClick={() => copyToClipboard(caption, `caption-${i}`)}
                         className="absolute top-4 right-4 text-gray-300 hover:text-[#1976D2]"
                       >
                          {copied === `caption-${i}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                       </button>
                    </div>
                  ))}
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Release Bio</h5>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                        <p className="text-sm text-gray-700 leading-relaxed pr-8 italic">{kit.bio}</p>
                        <button 
                          onClick={() => copyToClipboard(kit.bio, 'bio')}
                          className="absolute top-4 right-4 text-gray-300 hover:text-[#1976D2]"
                        >
                           {copied === 'bio' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Hashtags</h5>
                     <div className="flex flex-wrap gap-2">
                        {kit.hashtags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-[#1976D2] rounded-full text-xs font-bold">{tag}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
