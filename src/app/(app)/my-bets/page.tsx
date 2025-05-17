
"use client";

import Link from 'next/link';
import { ArrowLeft, Ticket, TrendingUp, TrendingDown, CircleHelp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import type { Bet } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function MyBetsPage() {
  const { placedBets } = useAppContext();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };
  
  const getBetStatusIcon = (status?: 'won' | 'lost' | 'pending') => {
    switch (status) {
      case 'won': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'lost': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <CircleHelp className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getBetStatusBadgeVariant = (status?: 'won' | 'lost' | 'pending'): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'won': return "default"; // Will use primary color
      case 'lost': return "destructive";
      case 'pending': return "secondary";
      default: return "outline";
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/landing" className="inline-flex items-center text-sm text-primary hover:underline mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Chat
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">My Placed Bets</h1>

      {placedBets.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto text-center shadow-lg">
           <CardHeader>
            <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Bets Placed Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg">
              It looks like you haven't placed any bets. Head over to the chat to get started!
            </CardDescription>
          </CardContent>
          <CardFooter>
             <Link href="/landing" className="mx-auto">
                <Button variant="default" className="bg-primary hover:bg-primary/90">Go to Chat</Button>
             </Link>
          </CardFooter>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placedBets.map((bet: Bet) => (
              <Card key={bet.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{bet.homeTeam} vs {bet.awayTeam}</CardTitle>
                      <CardDescription>Bet on: {bet.betWinnerTeam}</CardDescription>
                    </div>
                     <Badge variant={getBetStatusBadgeVariant(bet.betResult)} className="capitalize shrink-0">
                       {bet.betResult || 'Pending'}
                     </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Date:</span>
                    <span>{new Date(bet.gameDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bet Amount:</span>
                    <span className="font-semibold">{formatCurrency(bet.betAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odds:</span>
                    <span>{bet.odds.toFixed(2)}</span>
                  </div>
                   {bet.betGain !== undefined && (
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Gain/Loss:</span>
                       <span className={`font-semibold ${bet.betGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {formatCurrency(bet.betGain)}
                       </span>
                     </div>
                   )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-3 border-t mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <span>Bet Placed: {new Date(bet.betDate).toLocaleDateString()}</span>
                    {getBetStatusIcon(bet.betResult)}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
