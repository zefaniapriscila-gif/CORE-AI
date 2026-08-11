import React, { useState } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';

interface NormalModeScreenProps {
  onSendQuestion: (question: string) => void;
  aiResponse: string;
  isLoading: boolean;
  userQuestion: string;
}

export const NormalModeScreen: React.FC<NormalModeScreenProps> = ({
  onSendQuestion,
  aiResponse,
  isLoading,
  userQuestion,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendQuestion(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Gemini-style header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#E3DDD3]">
        <img src="https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png" className="w-6 h-6" alt="Gemini" />
        <span className="font-heading text-sm font-bold text-slate-800">Gemini</span>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF4EC] rounded-full border border-[#F99D45]/30">
          <Sparkles className="w-3 h-3 text-[#F4680A]" />
          <span className="text-[9px] font-bold text-[#D95300]">Normal Mode</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* User question */}
        {userQuestion && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#4E9DB8] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="bg-[#F0EBE5] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
              <p className="text-[12px] text-slate-800 leading-relaxed">{userQuestion}</p>
            </div>
          </div>
        )}

        {/* AI Response */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[#E3DDD3] max-w-[85%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F4680A] animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F99D45] animate-bounce" style={{animationDelay: '200ms'}} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E9DB8] animate-bounce" style={{animationDelay: '400ms'}} />
                </div>
                <span className="text-[10px] text-slate-500">Gemini sedang merespons...</span>
              </div>
            </div>
          </div>
        )}

        {aiResponse && !isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-[#E3DDD3] max-w-[85%] core-no-copy">
              <p className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{aiResponse}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-[#E3DDD3]">
        <div className="flex items-center gap-2 bg-[#F5F2EE] rounded-2xl px-4 py-2 border border-[#E3DDD3] focus-within:border-[#F99D45] transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 bg-transparent text-[12px] text-slate-800 placeholder-slate-400 outline-none"
          />
          <button
            onClick={handleSend}
            className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F4680A] to-[#F99D45] flex items-center justify-center text-white hover:shadow-md hover:shadow-orange-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
