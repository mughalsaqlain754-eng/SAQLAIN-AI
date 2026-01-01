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

  useEffect(() => {
    const savedHistory = localStorage.getItem('saqlain_ai_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const updateHistory = (chatId: string, currentMessages: Message[]) => {
    setHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === chatId);
        let newHistory = [...prev];
        const firstMessageText = currentMessages[0]?.text || "New Chat";
        const title = firstMessageText.length > 30 ? firstMessageText.substring(0, 30) + "..." : firstMessageText;
        const sessionData: ChatSession = {
            id: chatId,
            title: title,
            timestamp: Date.now(),
            messages: currentMessages
        };
        if (existingIndex >= 0) newHistory[existingIndex] = sessionData;
        else newHistory.unshift(sessionData);
        newHistory.sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem('saqlain_ai_history', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[]) => {
    let activeChatId = currentChatId;
    if (!activeChatId) {
        activeChatId = Date.now().toString();
        setCurrentChatId(activeChatId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments
    };
    
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
          isSavageMode, 
          (update) => {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId 
                    ? { ...msg, text: update.text, sources: update.sources } 
                    : msg
            ));
      });

      const isError = responseObj.text.includes("⚠️ SYSTEM ERROR") || responseObj.text.includes("⚠️ ENGINE OVERLOAD");
      
      setMessages(prev => {
          const finalMessages = prev.map(msg => 
              msg.id === aiMsgId 
                  ? { ...msg, text: responseObj.text, sources: responseObj.sources, isError } 
                  : msg
          );
          updateHistory(activeChatId as string, finalMessages);
          return finalMessages;
      });
      
    } catch (error) {
       const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: "I encountered a critical neural failure. Please retry.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => {
          const msgsWithError = prev.map(msg => msg.id === aiMsgId ? errorMsg : msg);
          updateHistory(activeChatId as string, msgsWithError);
          return msgsWithError;
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, isSavageMode]);

  const startNewChat = () => {
      setMessages([]);
      setCurrentChatId(null);
      setIsSidebarOpen(false);
  };

  const loadChat = (session: ChatSession) => {
      setCurrentChatId(session.id);
      setMessages(session.messages);
      setIsSidebarOpen(false);
  };

  return (
    <>
      {loadingSplash && <SplashScreen onComplete={() => setLoadingSplash(false)} />}
      <div className={`flex flex-col h-screen-safe bg-background text-textPrimary font-sans overflow-hidden transition-opacity duration-700 ${loadingSplash ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full px-4 pb-4 pt-[calc(env(safe-area-inset-top,1rem)+0.5rem)] flex items-center justify-between bg-background z-20 shrink-0 border-b border-surfaceLight/30">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-surfaceLight/50 rounded-xl text-textSecondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
                </svg>
            </button>
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