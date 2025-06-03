
import type { NavLink } from './types';
import { Home, ListPlus, Heart, User, LogIn, PlusSquare, LayoutList, Send } from 'lucide-react'; // Added Send

export const APP_NAME = "Estate Envision";

export const NAV_LINKS: { main: NavLink[]; loggedIn: NavLink[]; } = {
  main: [
    { href: '/properties', label: 'Properties', icon: Home },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/recommendations', label: 'Recommendations', icon: Send },
  ],
  loggedIn: [ 
    { href: '/add-property', label: 'Add Property', icon: ListPlus },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/recommendations', label: 'Recommendations', icon: Send },
  ]
};

export const USER_NAV_LINKS: NavLink[] = [ 
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/my-properties', label: 'My Properties', icon: LayoutList }, 
  { href: '/add-property', label: 'Add Property', icon: PlusSquare }, 
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/recommendations', label: 'Recommendations', icon: Send },
];

export const AUTH_NAV_LINKS: NavLink[] = [ 
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/register', label: 'Sign Up' },
];
