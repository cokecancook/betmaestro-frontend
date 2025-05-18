
"use client";

import Link from 'next/link';
import { Wallet, Ticket, UserCircle, LogOut } from 'lucide-react';
import BetMaestroLogo from './BetMaestroLogo';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from './ThemeToggle'; // Added import

const TopMenu: React.FC = () => {
  const { user, balance, placedBets, logout } = useAppContext();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/landing" aria-label="Go to BetMaestro landing page">
          <BetMaestroLogo />
        </Link>
        
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link href="/wallet" className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors" aria-label="View your wallet">
            <Wallet className="mr-1 h-5 w-5" />
            <span className="hidden sm:inline">Wallet:</span>
            <span className="ml-1 font-semibold">{formatCurrency(balance)}</span>
          </Link>
          
          <Link href="/my-bets" className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors" aria-label={`View your placed bets. You have ${placedBets.length} bets.`}>
            <Ticket className="mr-1 h-5 w-5" />
            <span className="hidden sm:inline">My Bets</span>
            {placedBets.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {placedBets.length}
              </span>
            )}
          </Link>

          <ThemeToggle /> 

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                   <UserCircle className="h-7 w-7 text-foreground hover:text-primary transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
};

export default TopMenu;
