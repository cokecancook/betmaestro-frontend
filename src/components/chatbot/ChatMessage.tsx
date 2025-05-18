
"use client";

import type React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added AvatarImage
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChatMessage as ChatMessageType, GenerateBettingStrategyOutput } from '@/types';
import { Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

interface ChatMessageProps {
  message: ChatMessageType;
  onOptionClick?: (option: { label: string; value: string }) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick }) => {
  const { theme, profileImage, user } = useAppContext(); // Get profileImage and user
  const isAI = message.sender === 'ai';

  const renderStrategy = (strategy: GenerateBettingStrategyOutput) => (
    <Card className="mt-2 bg-background/50 border-primary/50 shadow-md">
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">Strategy Description:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.strategyDescription}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Suggested Bets:</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {strategy.suggestedBets.map((bet, index) => (
              <li key={index}>{bet}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Risk Assessment:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.riskAssessment}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`flex items-end space-x-3 ${isAI ? '' : 'justify-end'} mb-6`}>
      {isAI && (
        <Avatar className="h-8 w-8 shrink-0 self-start mt-1">
          <AvatarFallback className="bg-orange-500">
            <Bot size={20} className={theme === 'light' ? 'text-white' : 'text-black'} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md ${
          isAI ? 'bg-card text-card-foreground rounded-bl-none' : 'bg-primary text-primary-foreground rounded-br-none'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <>
            {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
            {message.strategy && renderStrategy(message.strategy)}
            {message.options && message.options.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={isAI ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => onOptionClick && onOptionClick(option)}
                    className={isAI ? "border-primary text-primary hover:bg-primary/10" : "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary"}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {!isAI && (
        <Avatar className="h-8 w-8 shrink-0 self-start mt-1">
          {profileImage ? (
            <AvatarImage src={profileImage} alt={user?.name || 'User'} className="object-cover"/>
          ) : (
            <AvatarFallback className="bg-primary">
              <User size={20} className={theme === 'light' ? 'text-primary-foreground' : 'text-background'} />
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
