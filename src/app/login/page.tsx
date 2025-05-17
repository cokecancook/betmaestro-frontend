
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BetMaestroLogo from '@/components/BetMaestroLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggedIn, isLoading: contextIsLoading } = useAppContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (!contextIsLoading && isLoggedIn) {
      router.replace('/landing');
    }
  }, [contextIsLoading, isLoggedIn, router]);

  const handleLogin = async (preview: boolean) => {
    setIsSubmitting(true);
    await login(preview);
    // Navigation is handled by AppContext's login function
    // setIsSubmitting(false); // Might not be reached if navigation happens too fast
  };

  if (contextIsLoading || isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <BetMaestroLogo className="text-5xl mb-8" />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to BetMaestro</CardTitle>
          <CardDescription>Your AI-Powered Betting Assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90" 
            onClick={() => handleLogin(false)}
            disabled={isSubmitting}
            aria-label="Login to your BetMaestro account"
          >
            {isSubmitting && !useAppContext().useDummyData ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Login
          </Button>
          <Button 
            variant="outline" 
            className="w-full text-lg py-6 border-primary text-primary hover:bg-primary/10"
            onClick={() => handleLogin(true)}
            disabled={isSubmitting}
            aria-label="Preview BetMaestro with dummy data"
          >
            {isSubmitting && useAppContext().useDummyData ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Preview with Dummy Data
          </Button>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Gain insights and make smarter bets with AI.
      </p>
    </div>
  );
}
