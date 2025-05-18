
"use client";

import Link from 'next/link';
import { ArrowLeft, Wallet, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { balance, rechargeWallet, user } = useAppContext();
  const { toast } = useToast();

  const handleRecharge = () => {
    rechargeWallet(100);
    toast({
      title: "Wallet Recharged!",
      description: "100.00€ has been added to your balance.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="container mx-auto p-4">
      <Link href="/landing" className="inline-flex items-center text-sm text-primary hover:underline mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Chat
      </Link>

      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">My Wallet</h1>
        
        <Card className="w-full max-w-md shadow-xl bg-card">
          <CardHeader className="text-center pb-4">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">Current Balance</CardTitle>
            <CardDescription>Your available funds for betting.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold text-foreground mb-6">{formatCurrency(balance)}</p> 
            <Button 
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6" 
              onClick={handleRecharge}
              aria-label="Recharge your wallet with 100 Euros"
            >
              <PlusCircle className="mr-2 h-6 w-6" />
              Recharge 100€
            </Button>
          </CardContent>
        </Card>

        {user && (
           <p className="mt-8 text-sm text-muted-foreground">
            Wallet for user: <span className="font-semibold">{user.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}
