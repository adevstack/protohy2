
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { NAV_LINKS, AUTH_NAV_LINKS, USER_NAV_LINKS, APP_NAME } from '@/lib/constants';
import { Menu, X, LogOut, PlayCircle } from 'lucide-react'; 
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Separator } from '@/components/ui/separator';
import { logoutUser, loginDemoUser } from '@/lib/actions/auth.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, loading, refreshAuthStatus } = useAuthStatus();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // This is a conceptual event. Next.js router events are typically handled differently if needed.
  }, [router]);


  const handleLogout = async () => {
    setIsOpen(false); 
    const result = await logoutUser();
    if (result.success) {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      await refreshAuthStatus(); 
      window.dispatchEvent(new Event('authChange')); 
      router.push('/'); 
    } else {
      toast({
        title: 'Error',
        description: 'Logout failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDemoLogin = async () => {
    setIsOpen(false);
    const result = await loginDemoUser();
    if (result.success) {
      toast({
        title: 'Demo Login Successful',
        description: result.message || 'Logged in as Demo User!',
      });
      await refreshAuthStatus();
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    } else {
      toast({
        title: 'Demo Login Failed',
        description: result.message || 'Could not log in as Demo User. Please ensure the demo account is set up.',
        variant: 'destructive',
      });
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs bg-background p-0">
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
          <SheetClose asChild>
            <Logo />
          </SheetClose>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
              <span className="sr-only">Close Menu</span>
            </Button>
          </SheetClose>
        </SheetHeader>
         <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
         <SheetDescription className="sr-only">
            Main menu for {APP_NAME}. Access property listings, your profile, favorites, and authentication options.
         </SheetDescription>
        
        <div className="flex h-full flex-col">
          <nav className="flex-grow p-4 space-y-2">
            {NAV_LINKS.main.map((link) => (
              <SheetClose asChild key={`main-${link.href}`}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {link.icon && <link.icon className="h-5 w-5" />}
                  {link.label}
                </Link>
              </SheetClose>
            ))}
            
            <Separator className="my-4" />

            {loading ? (
              <div className="px-3 py-2 text-base font-medium text-muted-foreground">Loading...</div>
            ) : isAuthenticated && user ? (
              <>
                {USER_NAV_LINKS.map((link) => (
                   <SheetClose asChild key={`user-${link.href}`}>
                     <Link
                       href={link.href}
                       className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                     >
                        {link.icon && <link.icon className="h-5 w-5" />}
                       {link.label}
                     </Link>
                   </SheetClose>
                ))}
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="w-full flex items-center gap-3 justify-start rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" /> 
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                    onClick={handleDemoLogin}
                    variant="ghost"
                    className="w-full flex items-center gap-3 justify-start rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                    <PlayCircle className="h-5 w-5" />
                    Demo Login
                </Button>
                {AUTH_NAV_LINKS.map((link) => (
                  <SheetClose asChild key={`auth-${link.href}`}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {link.icon && <link.icon className="h-5 w-5" />}
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </>
            )}
          </nav>
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} {APP_NAME}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
