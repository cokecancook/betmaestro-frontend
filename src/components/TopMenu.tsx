
"use client";

import Link from 'next/link';
import { Wallet, Ticket, UserCircle, LogOut, Menu, Sun, Moon } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from './ThemeToggle'; 
import Image from 'next/image';

const TopMenu: React.FC = () => {
  const { user, balance, placedBets, logout, theme } = useAppContext();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const pendingBetsCount = placedBets.filter(bet => !bet.betResult || bet.betResult === 'pending').length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/landing" aria-label="Go to BetMaestro landing page">
          <BetMaestroLogo />
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-2 md:space-x-4">
          <Link href="/wallet" className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors" aria-label="View your wallet">
            <Wallet className="mr-1 h-5 w-5" />
            <span className="hidden sm:inline">Wallet:</span>
            <span className="ml-1 font-semibold">{formatCurrency(balance)}</span>
          </Link>
          
          <Link href="/my-bets" className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors" aria-label={`View your placed bets. You have ${pendingBetsCount} pending bets.`}>
            <Ticket className="mr-1 h-5 w-5" />
            <span className="hidden sm:inline">My Bets</span>
            {pendingBetsCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {pendingBetsCount}
              </span>
            )}
          </Link>

          <ThemeToggle /> 

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 text-foreground hover:text-primary hover:bg-transparent">
                   <UserCircle className="h-7 w-7" />
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

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Open menu"
                className="text-foreground hover:bg-secondary hover:text-primary"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card p-0 flex flex-col">
              <div className="p-4 border-b">
                <SheetClose asChild>
                    <Link href="/landing">
                        <BetMaestroLogo />
                    </Link>
                </SheetClose>
              </div>

              {user && (
                <div className="p-4 border-b">
                  <p className="text-base font-semibold leading-none text-foreground">{user.name}</p>
                  <p className="text-sm leading-none text-muted-foreground mt-1">
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                  </p>
                </div>
              )}
              
              <nav className="flex-grow p-4 space-y-1">
                <SheetClose asChild>
                  <Link href="/wallet" className="flex items-center p-3 rounded-md hover:bg-secondary group">
                    <Wallet className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-foreground group-hover:text-primary">Wallet: {formatCurrency(balance)}</span>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="/my-bets" className="flex items-center p-3 rounded-md hover:bg-secondary group">
                    <Ticket className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-foreground group-hover:text-primary">My Bets</span>
                    {pendingBetsCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {pendingBetsCount}
                      </span>
                    )}
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href="/profile" className="flex items-center p-3 rounded-md hover:bg-secondary group">
                    <UserCircle className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-foreground group-hover:text-primary">Profile</span>
                  </Link>
                </SheetClose>
                
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-secondary group">
                    <div className="flex items-center">
                         {theme === 'light' ? <Sun className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" /> : <Moon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary"/>}
                        <span className="text-foreground group-hover:text-primary">Theme</span>
                    </div>
                  <ThemeToggle />
                </div>
              </nav>

              {user && (
                <div className="p-4 border-t mt-auto">
                  <SheetClose asChild>
                    <Button variant="ghost" onClick={logout} className="w-full justify-start p-3 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground focus:text-destructive-foreground">
                      <LogOut className="mr-3 h-5 w-5" />
                      Log out
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default TopMenu;
