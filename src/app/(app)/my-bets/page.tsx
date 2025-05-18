
"use client";

import Link from 'next/link';
import { ArrowLeft, Ticket, ClipboardList, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import type { Bet } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MyBetsPage() {
  const { placedBets } = useAppContext();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const getBetStatusBadgeVariant = (status?: 'won' | 'lost' | 'pending'): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'won': return "default";
      case 'lost': return "destructive";
      case 'pending': return "secondary";
      default: return "outline";
    }
  };

  // Calculate summary statistics
  const totalBetsPlaced = placedBets.length;
  const totalGains = placedBets
    .filter(bet => bet.betResult === 'won' && typeof bet.betGain === 'number')
    .reduce((sum, bet) => sum + (bet.betGain || 0), 0);
  const totalLosses = placedBets
    .filter(bet => bet.betResult === 'lost')
    .reduce((sum, bet) => sum + bet.betAmount, 0);
  const betBalance = totalGains - totalLosses;

  const summaryStats = [
    { label: "Total Bets", value: totalBetsPlaced.toString(), icon: ClipboardList, color: "text-primary" },
    { label: "Total Gains", value: formatCurrency(totalGains), icon: TrendingUp, color: "text-green-500" },
    { label: "Total Losses", value: formatCurrency(totalLosses), icon: TrendingDown, color: "text-red-500" },
    { label: "Bet Balance", value: formatCurrency(betBalance), icon: Scale, color: betBalance >= 0 ? "text-green-500" : "text-red-500" },
  ];


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/landing" className="inline-flex items-center text-sm text-primary hover:underline mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Chat
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-center text-foreground">My Placed Bets</h1>

      {/* Betting Summary Card */}
      {placedBets.length > 0 && (
        <Card className="mb-8 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-center text-foreground">Betting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {summaryStats.map(stat => (
                <div key={stat.label} className="p-3 rounded-lg bg-background/70 flex flex-col items-center shadow">
                  <stat.icon className={cn("h-7 w-7 mb-1.5", stat.color)} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placedBets.map((bet: Bet) => (
              <Card key={bet.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{bet.homeTeam} vs {bet.awayTeam}</CardTitle>
                      <CardDescription>Bet on: {bet.betWinnerTeam}</CardDescription>
                    </div>
                     <Badge 
                       variant={getBetStatusBadgeVariant(bet.betResult)} 
                       className={cn(
                         "capitalize shrink-0",
                         bet.betResult === 'won' && "bg-green-500 text-white border-transparent hover:bg-green-600"
                       )}
                     >
                       {bet.betResult || 'Pending'}
                     </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Date:</span>
                    <span>{bet.gameDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bet Amount:</span>
                    <span className="font-semibold">{formatCurrency(bet.betAmount)}</span>
                  </div>
                  {bet.house && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">House:</span>
                      <span>{bet.house}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odds:</span>
                    <span>{bet.odds.toFixed(2)}</span>
                  </div>
                   {bet.betResult === 'lost' ? (
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Gain/Loss:</span>
                       <span className="font-semibold text-red-600">
                         {formatCurrency(-bet.betAmount)}
                       </span>
                     </div>
                   ) : bet.betResult === 'won' && bet.betGain !== undefined ? (
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Gain/Loss:</span>
                       <span className="font-semibold text-green-600">
                         {formatCurrency(bet.betGain)}
                       </span>
                     </div>
                   ) : null}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-3 border-t mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <span>Bet Placed: {bet.betDate}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
      )}
    </div>
  );
}

