import React, { useState, useCallback, useEffect } from 'react';
import { Message, Attachment, ChatSession } from './types';
import { sendMessageToGemini } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [loadingSplash, setLoadingSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavageMode, setIsSavageMode] = useState(false);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // 1. Initial Load: Only get the persisted history archive. 
  // We no longer automatically restore a partial/active unsaved session to satisfy "don't save every message".
  useEffect(() => {
    const savedHistory = localStorage.getItem('saqlain_ai_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error("History parse failed", e); }
    }
  }, []);

  // 2. Archive Function: Commits the current state of messages into the "History Archive" exactly ONCE.
  // This satisfies the request to save the session at once rather than every message.
  const archiveCurrentChat = useCallback(() => {
    if (messages.length === 0) return;

    setHistory(prev => {
      const activeId = currentChatId || Date.now().toString();
      const existingIndex = prev.findIndex(s => s.id === activeId);
      let newHistory = [...prev];
      
      const firstUserMsg = messages.find(m => m.role === 'user')?.text || "Untitled Session";
      const title = firstUserMsg.length > 35 ? firstUserMsg.substring(0, 35) + "..." : firstUserMsg;

      const sessionData: ChatSession = {
        id: activeId,
        title,
        timestamp: existingIndex >= 0 ? prev[existingIndex].timestamp : Date.now(),
        messages: [...messages]
      };

      if (existingIndex >= 0) {
        newHistory[existingIndex] = sessionData;
      } else {
        newHistory.unshift(sessionData);
      }

      // Keep recent entries at the top
      newHistory.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem('saqlain_ai_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [messages, currentChatId]);

  const deleteChat = (chatId: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(s => s.id !== chatId);
      localStorage.setItem('saqlain_ai_history', JSON.stringify(newHistory));
      return newHistory;
    });
    
    // If we're deleting the currently active (but unsaved) chat, clear the state
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments
    };
    
    const contextHistory = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
        id: aiMsgId,
        role: 'model',
        text: '', 
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const responseObj = await sendMessageToGemini(
          text, 
          attachments,
          contextHistory,
          isSavageMode, 
          (update) => {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId 
                    ? { ...msg, text: update.text, sources: update.sources } 
                    : msg
            ));
      });

      const isError = responseObj.text.includes("⚠️ SYSTEM ERROR") || responseObj.text.includes("⚠️ ENGINE OVERLOAD");
      
      setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
              ? { ...msg, text: responseObj.text, sources: responseObj.sources, isError } 
              : msg
      ));
      
    } catch (error) {
       setMessages(prev => {
          const aiMsg = prev.find(m => m.id === aiMsgId);
          if (aiMsg && aiMsg.text.length > 20) {
             return prev.map(msg => msg.id === aiMsgId ? { ...msg, text: msg.text + "\n\n⚠️ [STREAM INTERRUPTED]" } : msg);
          }
          
          const errorMsg: Message = {
            id: (Date.now() + 2).toString(),
            role: 'model',
            text: "Neural Link timed out. Please retry.",
            timestamp: Date.now(),
            isError: true
          };
          return prev.map(msg => msg.id === aiMsgId ? errorMsg : msg);
       });
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentChatId, isSavageMode]);

  const startNewChat = () => {
      // "Save once" happens when starting a new session
      archiveCurrentChat();
      setMessages([]);
      setCurrentChatId(null);
      setIsSidebarOpen(false);
  };

  const loadChat = (session: ChatSession) => {
      // "Save once" happens when switching to an archived session
      archiveCurrentChat();
      
      setCurrentChatId(session.id);
      setMessages(session.messages);
      setIsSidebarOpen(false);
  };

  return (
    <>
      {loadingSplash && <SplashScreen onComplete={() => setLoadingSplash(false)} />}
      <div className={`flex flex-col h-screen-safe bg-background text-textPrimary font-sans overflow-hidden transition-opacity duration-700 ${loadingSplash ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full px-4 pb-4 pt-[calc(env(safe-area-inset-top,1rem)+0.5rem)] flex items-center justify-between bg-background z-20 shrink-0 border-b border-surfaceLight/30">
            <div className="flex items-center gap-2">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-surfaceLight/50 rounded-xl text-textSecondary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                        <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
                    </svg>
                </button>
                {messages.length > 0 && (
                  <button 
                    onClick={archiveCurrentChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceLight/40 border border-white/5 text-[10px] font-mono tracking-widest text-accent hover:bg-accent/10 transition-all uppercase"
                    title="Archive this chat session now"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save
                  </button>
                )}
            </div>
            <div className="text-white font-mono font-bold tracking-widest text-sm select-none opacity-90 drop-shadow-sm">
                SAQLAIN AI <span className="text-accent">PRO</span>
            </div>
            <div className="w-10 flex justify-end">
                {isSavageMode && <span title="Aura Increased" className="text-xl animate-bounce">💀</span>}
            </div>
        </div>
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onNewChat={startNewChat}
            history={history}
            onLoadChat={loadChat}
            onDeleteChat={deleteChat}
            activeChatId={currentChatId}
            isSavageMode={isSavageMode}
            onToggleSavageMode={setIsSavageMode}
        />
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
            <ChatArea messages={messages} isLoading={isLoading} />
            <InputArea onSend={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
    </>
  );
};

export default App;