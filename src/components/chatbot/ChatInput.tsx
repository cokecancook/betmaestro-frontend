
"use client";

import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  // quickReplies prop removed
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, placeholder="Type your message..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // handleQuickReply function removed

  return (
    <div className="p-4 border-t bg-card">
      {/* Quick replies rendering block removed */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-grow focus-visible:ring-primary"
          disabled={disabled}
          aria-label="Chat message input"
        />
        <Button type="submit" variant="default" size="icon" disabled={disabled || !inputValue.trim()} aria-label="Send message" className="bg-primary hover:bg-primary/90">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
