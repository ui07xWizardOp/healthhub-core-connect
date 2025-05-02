
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
            <Button asChild variant="outline" className="mr-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button className="healthhub-button">
              <Link to="/signup">Sign Up</Link>
            </Button>
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
              <Button asChild variant="outline" className="w-full mb-2">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="healthhub-button w-full">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
