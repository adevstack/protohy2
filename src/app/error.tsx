
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error in ErrorBoundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
      <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold text-destructive mb-2">Oops! Something went wrong.</h1>
      <p className="text-lg text-foreground/80 mb-6 max-w-md">
        We encountered an unexpected issue. Please try again.
      </p>
      {error?.message && (
        <details className="mb-6 p-4 border rounded-md bg-muted text-muted-foreground text-left max-w-xl overflow-auto">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 text-sm whitespace-pre-wrap">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
            {error.stack && `\n\nStack Trace:\n${error.stack}`}
          </pre>
        </details>
      )}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        size="lg"
      >
        Try Again
      </Button>
      <Button variant="link" asChild className="mt-4">
        <a href="/">Go to Homepage</a>
      </Button>
    </div>
  )
}
