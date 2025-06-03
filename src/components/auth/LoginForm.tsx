
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/actions/auth.actions';
import { useState, useEffect } from 'react'; // Added useEffect
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();

  // Log the type of loginUser on component mount
  useEffect(() => {
    console.log('[LoginForm BROWSER LOG] typeof loginUser on mount:', typeof loginUser);
    if (typeof loginUser !== 'function') {
      console.error('[LoginForm BROWSER LOG] CRITICAL: loginUser is NOT a function. Check server action setup/import.');
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('[LoginForm BROWSER LOG] onSubmit triggered. Values:', values);
    setIsLoading(true);
    try {
      console.log('[LoginForm BROWSER LOG] Attempting to call loginUser server action...');
      const result = await loginUser(values);
      // This log will appear in the BROWSER console after the server action completes.
      console.log('[LoginForm BROWSER LOG] loginUser server action returned:', result);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Logged in successfully!',
        });
        
        await refreshAuthStatus();
        window.dispatchEvent(new Event('authChange')); // To notify other components like UserNav
        router.push('/'); // Redirect to homepage
      } else {
        toast({
          title: 'Login Error',
          description: result.message || 'Login failed. Please check your credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // This catches errors in the client-side execution of onSubmit, NOT necessarily server-side errors within loginUser.
      console.error('[LoginForm BROWSER LOG] Error in onSubmit calling loginUser or processing its result:', error);
      toast({
        title: 'Client Error',
        description: 'An unexpected client-side error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  );
}
