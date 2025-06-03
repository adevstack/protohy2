import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2.5 group">
      <Building2 className="h-8 w-8 text-primary transition-all duration-300 ease-out group-hover:rotate-[-10deg] group-hover:scale-110" />
      <span className="text-3xl font-extrabold tracking-tight">
        <span className="text-primary">Estate</span>
        <span className="text-accent">Envision</span>
      </span>
    </Link>
  );
}
