import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  history?: ChatSession[];
  onLoadChat?: (session: ChatSession) => void;
  activeChatId?: string | null;
  isSavageMode: boolean;
  onToggleSavageMode: (value: boolean) => void;
}

const RobotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-black">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    onClose, 
    onNewChat, 
    history = [], 
    onLoadChat, 
    activeChatId,
    isSavageMode,
    onToggleSavageMode
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[998] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-[300px] bg-surface z-[999] transition-transform duration-500 ease-in-out transform border-r border-white/5 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
               <RobotIcon />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tighter text-textPrimary">SAQLAIN AI PRO</div>
              <div className="text-[10px] text-accent font-mono uppercase">Developer Edition</div>
            </div>
          </div>

          <button 
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            <div className="px-2 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">Instance History</div>
            
            <div className="space-y-1">
                {history.map((session) => (
                    <div 
                        key={session.id}
                        onClick={() => onLoadChat && onLoadChat(session)}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm transition-all border ${
                            activeChatId === session.id 
                                ? 'bg-white/5 border-accent/30 text-accent font-medium' 
                                : 'hover:bg-white/5 border-transparent text-textSecondary'
                        }`}
                    >
                        <svg className="w-4 h-4 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <span className="truncate flex-1">{session.title}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-6 border-t border-white/5 space-y-6">
             {/* Savage Mode Toggle */}
             <div className="bg-surfaceLight/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-textPrimary uppercase tracking-tighter">Savage Protocol</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isSavageMode} onChange={(e) => onToggleSavageMode(e.target.checked)}/>
                        <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    </label>
                </div>
                <p className="text-[9px] text-gray-500 leading-tight">Enables aggressive roasting and unfiltered sarcasm.</p>
             </div>

             <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-[10px] font-mono tracking-tighter text-textSecondary uppercase">Neural Link Stable</span>
                </div>
             </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;