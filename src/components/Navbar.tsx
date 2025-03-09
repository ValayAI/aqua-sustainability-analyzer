
import React from 'react';
import { Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  activePage?: 'home' | 'dashboard' | 'compare' | 'insights' | 'about';
}

const Navbar: React.FC<NavbarProps> = ({ activePage = 'home' }) => {
  return (
    <header className="w-full py-4 px-6 glass z-50 fixed top-0 left-0 right-0 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Droplet className="h-6 w-6 text-water-600" />
          <span className="font-medium text-xl">Aqua Insights</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-medium ${
              activePage === 'home' 
                ? 'text-water-600' 
                : 'text-foreground/80 hover:text-foreground'
            } transition-colors focus-ring`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium ${
              activePage === 'dashboard' 
                ? 'text-water-600' 
                : 'text-foreground/80 hover:text-foreground'
            } transition-colors focus-ring`}
          >
            Dashboard
          </Link>
          <Link 
            to="#" 
            className={`text-sm font-medium ${
              activePage === 'compare' 
                ? 'text-water-600' 
                : 'text-foreground/80 hover:text-foreground'
            } transition-colors focus-ring`}
          >
            Compare Cities
          </Link>
          <Link 
            to="#" 
            className={`text-sm font-medium ${
              activePage === 'insights' 
                ? 'text-water-600' 
                : 'text-foreground/80 hover:text-foreground'
            } transition-colors focus-ring`}
          >
            Insights
          </Link>
          <Link 
            to="#" 
            className={`text-sm font-medium ${
              activePage === 'about' 
                ? 'text-water-600' 
                : 'text-foreground/80 hover:text-foreground'
            } transition-colors focus-ring`}
          >
            About
          </Link>
        </nav>
        
        <div className="md:hidden">
          <button className="p-2 rounded-md text-foreground/80 hover:text-foreground focus-ring">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
