
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="healthhub-container py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Services
            </Link>
            <Link to="/doctors" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Doctors
            </Link>
            <Link to="/lab-tests" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Lab Tests
            </Link>
            <Link to="/contact" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Contact
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User size={16} />
                    {user.user_metadata?.first_name || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer gap-2">
                    <LogOut size={16} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline" className="mr-2">
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="healthhub-button">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              className="text-gray-700"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/services" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/doctors" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Doctors
              </Link>
              <Link 
                to="/lab-tests" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Lab Tests
              </Link>
              <Link 
                to="/contact" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/settings" 
                    className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full mt-2"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="healthhub-button w-full">
                    <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
