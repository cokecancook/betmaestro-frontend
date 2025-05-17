
"use client";

import Link from 'next/link';
import { ArrowLeft, UserCircle, ShieldCheck, ShieldAlert, Gem, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export default function ProfilePage() {
  const { user, setPlan } = useAppContext();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>Loading user profile...</p>
      </div>
    );
  }

  const isPremium = user.plan === 'premium';

  const handlePlanChange = () => {
    const newPlan = isPremium ? 'basic' : 'premium';
    setPlan(newPlan);
    toast({
      title: "Plan Updated!",
      description: `You are now on the ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan.`,
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Link href="/landing" className="inline-flex items-center text-sm text-primary hover:underline mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Chat
      </Link>

      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">My Profile</h1>

        <Card className="w-full max-w-md shadow-xl bg-card">
          <CardHeader className="text-center items-center flex flex-col">
             <div className="relative mb-4">
                <Image 
                  src={`https://placehold.co/128x128.png?text=${user.name.substring(0,1).toUpperCase()}`} 
                  alt={`${user.name}'s profile picture`} 
                  width={128} 
                  height={128} 
                  className="rounded-full border-4 border-primary shadow-md"
                  data-ai-hint="profile avatar"
                />
                {isPremium && (
                  <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-2 rounded-full shadow-lg">
                    <Gem className="h-5 w-5" />
                  </div>
                )}
             </div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>Manage your account details and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-background/50">
              <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center">
                {isPremium ? <ShieldCheck className="h-6 w-6 mr-2 text-green-500" /> : <ShieldAlert className="h-6 w-6 mr-2 text-yellow-500" />}
                Current Plan
              </h3>
              <p className={`text-2xl font-bold ${isPremium ? 'text-primary' : 'text-muted-foreground'}`}>
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isPremium 
                  ? "Enjoy all exclusive features including AI bet placement!" 
                  : "Upgrade to Premium to unlock AI bet placement and more."}
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg py-6"
              variant={isPremium ? "outline" : "default"}
              onClick={handlePlanChange}
              aria-label={isPremium ? "Switch to Basic Plan" : "Activate Premium Plan"}
            >
              {isPremium ? (
                <>
                  <ShieldAlert className="mr-2 h-5 w-5" /> Switch to Basic
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Activate Premium
                </>
              )}
            </Button>
          </CardContent>
           <CardFooter className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Changes to your plan are effective immediately.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
