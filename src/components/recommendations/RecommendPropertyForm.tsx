
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createRecommendation } from '@/lib/actions/recommendation.actions';
import { Loader2, Send } from 'lucide-react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
  recipientEmail: z.string().email({ message: 'Invalid email address.' }),
  message: z.string().max(500, { message: 'Message cannot exceed 500 characters.' }).optional(),
});

interface RecommendPropertyFormProps {
  propertyId: string;
  propertyTitle: string;
}

export function RecommendPropertyForm({ propertyId, propertyTitle }: RecommendPropertyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuthStatus();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientEmail: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isAuthenticated) {
      toast({ title: 'Authentication Required', description: 'Please log in to recommend properties.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await createRecommendation({
        propertyId,
        recipientEmail: values.recipientEmail,
        message: values.message,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        form.reset();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (authLoading) {
    return <div className="p-4 text-center">Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Recommend This Property</CardTitle>
          <CardDescription>Want to share "{propertyTitle}" with someone?</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">
            Please <Link href="/login" className="text-primary hover:underline font-semibold">log in</Link> to send recommendations.
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>Recommend "{propertyTitle}"</CardTitle>
        <CardDescription>Share this property with someone you know.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient&apos;s Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="friend@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Optional Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Check out this amazing property!" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Recommendation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
