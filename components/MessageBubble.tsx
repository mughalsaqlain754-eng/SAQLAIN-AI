import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-accent">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const ShieldCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const isIntelligenceReport = 
    message.text.includes('INTELLIGENCE REPORT') || 
    message.text.includes('SIM DATA') || 
    message.text.includes('SUCCESS RATE') ||
    message.text.includes('SECURITY RESEARCH') ||
    message.text.includes('VULNERABILITY');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract confidence if present
  const confidenceMatch = message.text.match(/SUCCESS RATE.*?:?\s*(\d+)%/i);
  const confidenceValue = confidenceMatch ? parseInt(confidenceMatch[1]) : null;

  return (
    <div className={`flex w-full mb-8 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(77,124,255,0.3)] border border-accent/20">
             <RobotIcon />
          </div>
        )}

        <div className="flex flex-col flex-1">
            <div 
                className={`relative px-4 py-3 shadow-sm ${
                isUser 
                    ? 'bg-surfaceLight text-textPrimary rounded-2xl rounded-tr-none border border-white/5' 
                    : isIntelligenceReport 
                        ? 'bg-[#111111] rounded-2xl border border-accent/30 shadow-[0_0_20px_rgba(77,124,255,0.05)]'
                        : 'bg-transparent text-textPrimary'
                }`}
            >
                {/* Confidence Badge for Reports */}
                {isIntelligenceReport && confidenceValue !== null && (
                    <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-3 py-1 bg-background border border-accent/30 rounded-full shadow-lg z-10">
                        <div className={`w-1.5 h-1.5 rounded-full ${confidenceValue > 80 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                        <span className="text-[9px] font-bold text-textPrimary font-mono uppercase tracking-widest">Confidence: {confidenceValue}%</span>
                    </div>
                )}

                {message.attachments && message.attachments.length > 0 && (
                <div className={`mb-3 flex flex-wrap gap-2 ${isUser ? 'justify-end' : ''}`}>
                    {message.attachments.map((att, idx) => (
                    att.mimeType.startsWith('image/') ? (
                        <img 
                            key={idx} 
                            src={att.data} 
                            alt="attachment" 
                            className="h-40 w-auto rounded-xl object-cover border border-white/10 hover:border-accent/50 transition-colors cursor-zoom-in"
                        />
                    ) : (
                        <div key={idx} className="flex items-center gap-2 bg-surfaceLight p-3 rounded-xl text-xs border border-white/5">
                            <span className="text-accent text-lg">📄</span>
                            <span className="font-mono">{att.name || 'document.pdf'}</span>
                        </div>
                    )
                    ))}
                </div>
                )}

                <div className={`prose prose-invert max-w-none ${isUser ? 'text-sm' : 'text-base leading-relaxed'}`}>
                <ReactMarkdown
                    components={{
                        code({node, inline, className, children, ...props}: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                            <div className="relative group my-6 overflow-hidden rounded-xl border border-white/10">
                                <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                                    <span>{match[1]}</span>
                                    <button onClick={() => navigator.clipboard.writeText(String(children))} className="hover:text-accent transition-colors">COPY</button>
                                </div>
                                <pre className="bg-[#0f0f0f] p-4 overflow-x-auto m-0">
                                    <code className={`${className} font-mono text-sm`} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                            ) : (
                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm" {...props}>
                                {children}
                            </code>
                            )
                        },
                        p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                        strong: ({children}) => <strong className="text-accent font-bold">{children}</strong>,
                        a: ({href, children}) => <a href={href} target="_blank" className="text-accent hover:underline">{children}</a>
                    }}
                >
                    {message.text}
                </ReactMarkdown>
                </div>

                {/* Grounding Sources */}
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-5 p-4 rounded-xl bg-[#0d0d0d] border border-white/5 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck />
                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-mono">Real-Time Intelligence Grounding</span>
                            </div>
                            <span className="text-[9px] text-gray-600 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5">SCAN ENABLED</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {message.sources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-textSecondary hover:text-white transition-all flex items-center gap-3 py-1 group/link"
                                >
                                    <span className="shrink-0 text-[10px] text-accent/40 font-mono group-hover/link:text-accent transition-colors">[{idx + 1}]</span>
                                    <span className="truncate underline decoration-white/10 group-hover/link:decoration-accent/40">{source.title}</span>
                                    <svg className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {!isUser && !message.isError && !isStreaming && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surfaceLight border border-white/5 text-[10px] font-mono tracking-widest text-gray-400 hover:text-accent hover:border-accent/30 transition-all uppercase group"
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    {message.sources && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{message.sources.length} Intelligence Points</span>
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