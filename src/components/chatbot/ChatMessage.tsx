
"use client";

import type React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChatMessage as ChatMessageType, GenerateBettingStrategyOutput, SuggestedBet } from '@/types';
import { Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  onOptionClick?: (option: { label: string; value: string }) => void;
  isFirstInList?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick, isFirstInList }) => {
  const { theme, profileImage, user } = useAppContext();
  const isAI = message.sender === 'ai';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const renderStrategy = (strategy: GenerateBettingStrategyOutput) => (
    <div className="mt-2 space-y-3">
      <div>
        <h4 className="font-semibold text-foreground mb-1">Strategy Description:</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.strategyDescription}</p>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mt-3 mb-2">Suggested Bets:</h4>
        <div className="space-y-3">
          {strategy.suggestedBets.map((bet: SuggestedBet, index: number) => (
            <Card key={index} className="bg-background/70 border-primary/30 shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-base mb-0.5">{bet.homeTeam} vs {bet.awayTeam}</CardTitle>
                <CardDescription className="text-xs">Bet on: {bet.betWinnerTeam} ({bet.house})</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Game Date:</span>
                  <span>{bet.gameDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bet Amount:</span>
                  <span className="font-semibold">{typeof bet.betAmount === 'number' ? formatCurrency(bet.betAmount) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Odds:</span>
                  <span>{typeof bet.odds === 'number' ? bet.odds.toFixed(2) : 'N/A'}</span>
                </div>
                 <div className="pt-1">
                  <p className="text-muted-foreground font-medium">Justification:</p>
                  <p className="whitespace-pre-wrap">{bet.justification}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mt-3 mb-1">Risk Assessment:</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{strategy.riskAssessment}</p>
      </div>
    </div>
  );

  return (
    <div className={cn(
      `flex items-end space-x-3 mb-6`,
      isAI ? '' : 'justify-end',
      isFirstInList && isAI && 'mt-4'
    )}>
      {isAI && (
        <Avatar className="h-8 w-8 shrink-0 self-start mt-1">
          <AvatarFallback className="bg-orange-500">
            <Bot size={20} className={cn(theme === 'light' ? 'text-white' : 'text-black')} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow-md',
          isAI ? 'bg-card text-card-foreground rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
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
            <AvatarFallback className={cn("bg-primary", theme === 'dark' ? "text-background" : "text-primary-foreground" )}>
              <User size={20} />
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
