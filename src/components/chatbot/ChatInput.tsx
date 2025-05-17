
"use client";

import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic } from 'lucide-react'; // Assuming Mic for future voice input

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  quickReplies?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, quickReplies, disabled, placeholder="Type your message..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickReply = (value: string) => {
    if (!disabled) {
      onSendMessage(value);
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      {quickReplies && quickReplies.length > 0 && !disabled && (
        <div className="mb-2 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply.value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply.value)}
              className="border-primary text-primary hover:bg-primary/10"
            >
              {reply.label}
            </Button>
          ))}
        </div>
      )}
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
        {/* <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" disabled={disabled} aria-label="Use voice input">
          <Mic className="h-5 w-5" />
        </Button> */}
        <Button type="submit" variant="default" size="icon" disabled={disabled || !inputValue.trim()} aria-label="Send message" className="bg-primary hover:bg-primary/90">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
