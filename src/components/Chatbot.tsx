'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

const QUICK_REPLIES = [
  "How many paid leaves can I take?",
  "What are the office timings?",
  "How to check my attendance?",
  "Where are my payslips?"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hi there! 👋 I am the HR Assistant Bot. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('leave') || lowerInput.includes('holiday')) {
      return "Employees are typically entitled to 12 Paid Leaves and 12 Sick Leaves per year. You can request them via the Time Off tab.";
    }
    if (lowerInput.includes('timing') || lowerInput.includes('hour') || lowerInput.includes('time')) {
      return "Core working hours are from 10:00 AM to 4:00 PM. Please ensure you are checked in during these hours.";
    }
    if (lowerInput.includes('attendance') || lowerInput.includes('check in')) {
      return "You can check in, check out, and view your daily logs right from the Attendance tab.";
    }
    if (lowerInput.includes('payslip') || lowerInput.includes('salary') || lowerInput.includes('pay')) {
      return "Your payslips are generated on the last working day of the month and can be downloaded from the Payslips tab.";
    }
    
    return "I'm a simple bot and I'm not sure how to answer that just yet! Try asking about leaves, attendance, or timings.";
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate typing delay for bot
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="sketchy-card bg-white w-80 md:w-96 h-[500px] max-h-[80vh] flex flex-col mb-4 shadow-xl overflow-hidden animate-fade-in relative">
          <div className="tape-corner tape-corner-tl" />
          
          {/* Header */}
          <div className="bg-[var(--uxsg-teal)] p-4 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center font-bold">
                🤖
              </div>
              <h3 className="font-headline font-bold text-lg text-black">HR Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 paper-bg">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 text-sm font-body ${
                    msg.role === 'user' 
                      ? 'bg-[var(--uxsg-yellow)] border-2 border-black rounded-[20px_20px_0px_20px] shadow-[2px_2px_0px_black]' 
                      : 'bg-white border-2 border-black rounded-[20px_20px_20px_0px] shadow-[2px_2px_0px_black]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 bg-white flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  className="font-body text-[10px] sm:text-xs font-semibold bg-[var(--uxsg-paper)] border border-black rounded-full px-3 py-1 hover:bg-[var(--uxsg-teal)] transition-colors text-left"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t-2 border-black flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 sketchy-input !py-2 text-sm"
            />
            <button
              onClick={() => handleSend(inputValue)}
              className="w-10 h-10 bg-[var(--uxsg-yellow)] border-2 border-black rounded-full flex items-center justify-center hover:bg-[var(--uxsg-teal)] transition-colors shadow-[2px_2px_0px_black] active:translate-y-[2px] active:shadow-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[var(--uxsg-teal)] border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_black] hover:-translate-y-1 transition-all animate-bounce"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
