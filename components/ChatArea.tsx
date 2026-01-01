import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
      <div className="max-w-4xl mx-auto min-h-full flex flex-col">
        
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center px-4">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                SAQLAIN AI PRO
             </h2>
             
             <p className="text-textSecondary text-sm md:text-lg max-w-lg leading-relaxed font-medium opacity-80 uppercase tracking-widest">
                Professional Ai Designed By SAQLAIN Provide Anything You Want
             </p>
             <div className="mt-8 flex gap-4 text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                <span>Zero Fluff</span>
                <span>•</span>
                <span>Direct Answers</span>
                <span>•</span>
                <span>No Opinions</span>
             </div>
          </div>
        ) : (
          <div className="py-8">
            {messages.map((msg, index) => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isStreaming={isLoading && index === messages.length - 1 && msg.role === 'model'}
                />
            ))}
          </div>
        )}
        
        {isLoading && (messages.length === 0 || (messages[messages.length-1].role === 'model' && !messages[messages.length-1].text)) && (
            <div className="flex justify-start mb-8 animate-pulse">
                <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Compiling...</span>
                </div>
            </div>
        )}
        
        <div ref={bottomRef} className="h-4 w-full" />
      </div>
    </div>
  );
};

export default ChatArea;