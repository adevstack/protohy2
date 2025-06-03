
'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AuthStatusIndicator() {
  const { isAuthenticated, user, loading } = useAuthStatus();

  return (
    <Card className="w-full max-w-md mx-auto my-8 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          {isAuthenticated ? (
            <ShieldCheck className="mr-2 h-6 w-6 text-green-500" />
          ) : (
            <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
          )}
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="text-foreground">
            <p className="font-semibold">You are logged in.</p>
            {user.name && <p>Name: {user.name}</p>}
            {user.email && <p>Email: {user.email}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">You are not currently logged in.</p>
        )}
      </CardContent>
    </Card>
  );
}
