import React, { useState, useRef, ChangeEvent } from 'react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSend(inputText, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: reader.result as string,
            name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8 pt-2">
      <div className="relative bg-surfaceLight/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl transition-all duration-300 focus-within:border-accent/30 focus-within:shadow-[0_0_20px_rgba(0,255,65,0.05)]">
        
        {/* Attachment Ribbon */}
        {attachments.length > 0 && (
            <div className="flex gap-2 px-4 py-3 border-b border-white/5 overflow-x-auto">
                {attachments.map((att, idx) => (
                    <div key={idx} className="relative shrink-0 group">
                        {att.mimeType.startsWith('image/') ? (
                            <img src={att.data} alt="prev" className="h-14 w-14 object-cover rounded-xl border border-white/10" />
                        ) : (
                            <div className="h-14 w-14 flex items-center justify-center bg-background rounded-xl border border-white/10 text-[10px] font-mono text-accent">FILE</div>
                        )}
                        <button 
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 bg-background text-white rounded-full p-1 border border-white/10 hover:bg-red-500 transition-colors"
                        >
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="flex items-end gap-3 p-3">
            {/* Action Buttons */}
            <div className="flex items-center pb-1">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-textSecondary hover:text-accent hover:bg-white/5 rounded-xl transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
            </div>

            {/* Input Field */}
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                    setInputText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask SAQLAIN AI PRO anything..."
                className="flex-1 bg-transparent text-textPrimary text-base placeholder-gray-500 resize-none outline-none py-2.5 min-h-[44px] leading-relaxed"
                rows={1}
            />

            {/* Submit Button */}
            <div className="pb-1">
                <button
                    onClick={handleSend}
                    disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                        (inputText.trim() || attachments.length > 0) && !isLoading
                            ? 'bg-accent text-black shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:scale-105 active:scale-95' 
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
      </div>
      <p className="text-center text-[9px] text-gray-600 mt-3 uppercase tracking-widest font-mono">
        SECURE NEURAL LINK • PRO-LEVEL ENCRYPTION • SAQLAIN AI 
      </p>
    </div>
  );
};

export default InputArea;