import React, { useState } from 'react';
import { Upload, ChevronRight, CheckCircle2, FileSpreadsheet, AlertCircle, Info, Download, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BulkImportPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { accessToken } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    // In a real app, we'd send the file to the backend
    // For this demo, we'll parse it here to show step 2
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Mock processing result
        setTimeout(() => {
          setResults({
            total: rows.length,
            success: Math.floor(rows.length * 0.9),
            failed: Math.ceil(rows.length * 0.1),
            rows: rows.map((r: any, i: number) => ({
              row: i + 1,
              title: r.Title || r.title || 'Unknown',
              status: i % 10 === 0 ? 'Error: Missing UPC' : 'Valid'
            }))
          });
          setStep(2);
          setIsProcessing(false);
        }, 1500);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="text-[#1976D2] mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-medium text-blue-900">Important! Following your valuable feedback on the XLS 'Album - extended' template, we have improved the template to make ingestion easier.</p>
          <p className="text-sm text-blue-700 mt-1">Please download the new template here, and note that the old template is deprecated. For more info on how to fill the template, please refer to Believe knowledge base.</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-12 py-8">
        <Step icon={<Upload size={24} />} number={1} label="Upload" active={step === 1} completed={step > 1} />
        <ChevronRight className="text-gray-300" />
        <Step icon={<FileSpreadsheet size={24} />} number={2} label="Analyze" active={step === 2} completed={step > 2} />
        <ChevronRight className="text-gray-300" />
        <Step icon={<CheckCircle2 size={24} />} number={3} label="Confirm" active={step === 3} completed={step > 3} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1 space-y-4">
               <h3 className="text-lg font-bold text-gray-800">Select our Excel metadata template:</h3>
               <div className="space-y-2">
                 {[
                   "Album - extended (Audio / Apple video)",
                   "Classical (Opera)",
                   "Classical (Other)",
                   "Jazz"
                 ].map(t => (
                   <button key={t} className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-[#1976D2] hover:text-[#1976D2] transition-all group">
                     <span className="text-sm font-medium">{t}</span>
                     <Download size={16} className="text-gray-400 group-hover:text-[#1976D2]" />
                   </button>
                 ))}
               </div>
               <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-2">
                 <p className="text-xs text-red-700 font-bold flex items-center gap-2">
                   <AlertCircle size={14} />
                   WARNING
                 </p>
                 <ul className="text-[11px] text-red-600 list-disc ml-4 space-y-1">
                   <li>Please follow the guidelines included in the file.</li>
                   <li>Do not try to alter the template in any way.</li>
                   <li>(i.e.: by adding or removing columns or changing columns titles)</li>
                 </ul>
               </div>
            </div>

            <div className="lg:col-span-2">
              <div className="h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 hover:border-[#1976D2] transition-colors group">
                {file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 text-[#1976D2] rounded-2xl flex items-center justify-center shadow-sm">
                      <FileSpreadsheet size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button 
                        onClick={() => setFile(null)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={processImport}
                        disabled={isProcessing}
                        className="px-8 py-2 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center gap-2"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Import'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      id="bulk-upload" 
                      className="hidden" 
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="bulk-upload" 
                      className="cursor-pointer flex flex-col items-center gap-4 group-hover:scale-105 transition-transform"
                    >
                      <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center transition-colors group-hover:bg-blue-50 group-hover:text-[#1976D2]">
                        <Upload size={40} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-700">Your file is completed? Upload it here:</p>
                        <p className="text-sm text-gray-400">Drag & drop or click to browse</p>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="analyze"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Analyze results</h3>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-50 text-[#1976D2] rounded-full font-bold">{results?.total} Total</span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold">{results?.success} Successful</span>
                <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full font-bold">{results?.failed} Errors</span>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F5F5F5] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Row</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Title</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results?.rows.map((row: any) => (
                    <tr key={row.row} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-500">{row.row}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">{row.title}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[11px] font-bold uppercase",
                          row.status === 'Valid' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
               <button 
                 onClick={() => setStep(1)}
                 className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => setStep(3)}
                 className="px-8 py-2 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
               >
                 Go to summary
               </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center space-y-6"
          >
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={64} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-800">Import Successful!</h2>
              <p className="text-gray-500 max-w-sm">We've processed your Excel file. {results?.success} new releases have been added to your drafts.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-200 text-gray-500 rounded-full font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Import more
              </button>
              <button 
                className="px-8 py-2 bg-[#1976D2] text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors"
              >
                Go to Catalog
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Step: React.FC<{ icon: React.ReactNode; number: number; label: string; active: boolean; completed: boolean }> = ({ icon, number, label, active, completed }) => (
  <div className={cn(
    "flex flex-col items-center gap-2 transition-all duration-500",
    active ? "scale-110" : "scale-100",
    (active || completed) ? "text-[#1976D2]" : "text-gray-300"
  )}>
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
      active ? "bg-[#1976D2] text-white border-[#1976D2] shadow-lg shadow-blue-200" : 
      completed ? "bg-white text-[#1976D2] border-[#1976D2]" : "bg-white text-gray-300 border-gray-100"
    )}>
      {completed ? <CheckCircle2 size={24} /> : icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
  </div>
);
