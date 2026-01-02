import React, { useState } from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const RobotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" className="text-accent">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
    </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([message.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `saqlain-ai-solution-${message.id.slice(-4)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`flex w-full mb-6 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] lg:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {!isUser && (
          <div className="relative shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-accent/20 shadow-[0_0_10px_rgba(77,124,255,0.2)]">
               <RobotIcon />
            </div>
            {isStreaming && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-accent rounded-full animate-pulse shadow-[0_0_5px_rgba(77,124,255,0.8)]"></div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0">
            <div className={`relative px-4 py-3 ${isUser ? 'bg-surfaceLight rounded-2xl rounded-tr-none border border-white/5 shadow-sm' : 'bg-transparent text-textPrimary'}`}>
                
                {message.attachments && message.attachments.length > 0 && (
                <div className={`mb-3 flex flex-wrap gap-2 ${isUser ? 'justify-end' : ''}`}>
                    {message.attachments.map((att, idx) => (
                    att.mimeType.startsWith('image/') ? (
                        <img key={idx} src={att.data} alt="attachment" className="h-64 md:h-80 rounded-xl object-cover border border-white/10 shadow-lg" />
                    ) : (
                        <div key={idx} className="flex items-center gap-2 bg-surfaceLight p-3 rounded-xl text-[10px] font-mono border border-white/5 uppercase tracking-wider">
                            <span className="text-accent font-bold">Document</span>
                            <span className="opacity-60">{att.name}</span>
                        </div>
                    )
                    ))}
                </div>
                )}

                <div className={`whitespace-pre-wrap text-lg md:text-xl leading-relaxed break-words font-sans tracking-tight ${!isUser ? 'selection:bg-accent/30' : ''}`}>
                    {message.text}
                </div>

                {!isUser && !message.isError && !isStreaming && (
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleCopy}
                            className="p-2 text-gray-500 hover:text-accent hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group"
                            title="Copy text"
                        >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                            <span className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                        </button>

                        <button 
                            onClick={handleDownload}
                            className="p-2 text-gray-500 hover:text-accent hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 group"
                            title="Download as text file"
                        >
                            <DownloadIcon />
                            <span className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">Download</span>
                        </button>
                    </div>
                    
                    {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest border-l-2 border-accent pl-2">
                                External Grounding:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {message.sources.map((source, sIdx) => (
                                    <a 
                                        key={sIdx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-mono bg-white/5 hover:bg-accent/10 border border-white/10 px-2 py-1 rounded text-accent transition-all truncate max-w-[250px]"
                                        title={source.title}
                                    >
                                        {source.title || 'Source Reference'}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;