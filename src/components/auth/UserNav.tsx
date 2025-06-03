
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, LogOut, PlusSquare, UserCircle, Heart, LayoutList, PlayCircle } from 'lucide-react';
import { logoutUser, loginDemoUser } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function UserNav() {
  const { user, isAuthenticated, loading, refreshAuthStatus } = useAuthStatus();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Button variant="outline" onClick={handleDemoLogin} size="sm">
          <PlayCircle className="mr-2 h-4 w-4" /> Demo Login
        </Button>
        <Button variant="ghost" asChild size="sm">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.email}.png?size=36`} alt={user.name || user.email} />
            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-properties">
             <LayoutList className="mr-2 h-4 w-4" />
              <span>My Properties</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/add-property">
              <PlusSquare className="mr-2 h-4 w-4" />
              <span>Add Property</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/favorites">
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
