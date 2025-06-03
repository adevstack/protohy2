import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { UserNav } from '@/components/auth/UserNav';
import { NAV_LINKS } from '@/lib/constants';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle'; // Added ThemeToggle

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8"> {/* Changed max-w-screen-2xl to xl */}
        <div className="flex items-center">
          <Logo />
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {NAV_LINKS.main.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for ThemeToggle */}
          <ThemeToggle />
          <UserNav />
          <div className="md:hidden">
             <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
