
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldAlert, UserCircle, Mail, Edit3 } from 'lucide-react';
import { verifyAccessToken } from '@/lib/jwt';
import { getUserById } from '@/lib/actions/auth.actions'; // Assuming this fetches user details

// Ensure this page is dynamically rendered because it checks auth status
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  let user = null;

  if (accessToken) {
    const decodedToken = verifyAccessToken(accessToken);
    if (decodedToken && decodedToken.userId) {
      // Fetch full user details. Ensure getUserById doesn't expose sensitive info.
      user = await getUserById(decodedToken.userId);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You need to be logged in to view your profile.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login to View Profile</Link>
        </Button>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader className="p-6 text-center items-center">
           <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20 shadow-md">
            <AvatarImage src={user.avatarUrl || `https://avatar.vercel.sh/${user.email}.png?size=96`} alt={user.name || user.email} />
            <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-primary">{user.name || 'User Profile'}</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
              <UserCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-md font-medium text-foreground">{user.name || 'Not Provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="text-md font-medium text-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6" disabled>
             <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
          </Button>
           <p className="text-xs text-muted-foreground text-center pt-4">
            For account deletion or other data requests, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'My Profile | Estate Envision',
  description: 'View and manage your Estate Envision profile details.',
};

