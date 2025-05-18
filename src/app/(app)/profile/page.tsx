
"use client";

import Link from 'next/link';
import { ArrowLeft, UserCircle, ShieldAlert, Gem, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

const PROFILE_IMAGE_STORAGE_KEY = 'betMaestroProfileImage';

export default function ProfilePage() {
  const { user, setPlan, profileImage: appContextProfileImage, setProfileImage: setAppContextProfileImage } = useAppContext();
  const { toast } = useToast();

  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(appContextProfileImage);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaultProfileImage = useCallback(() => {
    if (user) {
      return `https://placehold.co/128x128.png?text=${user.name.substring(0,1).toUpperCase()}`;
    }
    return 'https://placehold.co/128x128.png';
  }, [user]);

  useEffect(() => {
    const storedImage = localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY);
    if (appContextProfileImage) {
      setProfileImageSrc(appContextProfileImage);
    } else if (storedImage) {
      setProfileImageSrc(storedImage);
      setAppContextProfileImage(storedImage); 
    }
     else {
      setProfileImageSrc(getDefaultProfileImage());
    }
  }, [appContextProfileImage, getDefaultProfileImage, setAppContextProfileImage]);


  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setProfileImageSrc(dataUri);
        setAppContextProfileImage(dataUri); 
        toast({
          title: "Profile Image Updated",
          description: "Your new profile image has been set.",
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Please upload a valid image file (e.g., PNG, JPG).",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleImageUpload(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  const handleDeleteImage = () => {
    const defaultImage = getDefaultProfileImage();
    setProfileImageSrc(defaultImage);
    setAppContextProfileImage(null); 
    toast({
      title: "Profile Image Removed",
      description: "Your profile image has been reset to default.",
    });
  };

  const handleImageContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleImageUpload(event.target.files[0]);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading user profile...</p>
      </div>
    );
  }

  const isPremium = user.plan === 'premium';
  const isCustomImage = profileImageSrc?.startsWith('data:image/');

  const handlePlanChange = () => {
    const newPlan = isPremium ? 'basic' : 'premium';
    setPlan(newPlan);
    toast({
      title: "Plan Updated!",
      description: `You are now on the ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan.`,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Link href="/landing" className="inline-flex items-center text-sm text-primary hover:underline mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Chat
      </Link>

      <div className="flex flex-col items-center">
        <Card className="w-full max-w-md shadow-xl bg-card mt-0">
          <CardHeader className="text-center items-center flex flex-col">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept="image/*"
              className="hidden"
            />
            <div
              className={`relative mb-4 w-32 h-32 rounded-full border-4 group transition-all duration-200 ease-in-out cursor-pointer
                ${isDragging ? 'border-primary scale-105 shadow-lg' : 'border-muted hover:border-primary'}
                ${isCustomImage ? 'border-primary' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
              onClick={handleImageContainerClick}
              role="button"
              tabIndex={0}
              aria-label="Upload profile image"
            >
              {profileImageSrc && (
                <Image
                  src={profileImageSrc}
                  alt={`${user.name}'s profile picture`}
                  width={128}
                  height={128}
                  className="rounded-full object-cover w-full h-full"
                  data-ai-hint={isCustomImage ? "user uploaded" : "profile avatar"}
                  key={profileImageSrc} 
                />
              )}
              {!isCustomImage && !isDragging && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <UploadCloud className="h-8 w-8 text-white mb-1" />
                    <p className="text-xs text-white text-center">Click or drop image</p>
                 </div>
              )}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/30 rounded-full pointer-events-none">
                  <UploadCloud className="h-10 w-10 text-primary-foreground" />
                </div>
              )}
              {isCustomImage && isHoveringImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDeleteImage();
                  }}
                  aria-label="Delete profile image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {isPremium && (
                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-2 rounded-full shadow-lg z-10 pointer-events-none">
                  <Gem className="h-5 w-5" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>Manage your account details and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-background/50">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Current Plan
              </h3>
              <p className={`text-2xl font-bold ${isPremium ? 'text-accent' : 'text-primary'}`}>
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
              variant={isPremium ? "outline" : "default"}
              className={cn(
                "w-full text-lg py-6",
                isPremium 
                  ? "border-primary text-primary hover:bg-primary/10 hover:text-primary" 
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
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
