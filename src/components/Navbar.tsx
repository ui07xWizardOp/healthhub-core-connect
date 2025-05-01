
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
            <Link to="/pharmacy" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Pharmacy
            </Link>
            <Link to="/laboratory" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Laboratory
            </Link>
            <Link to="/customers" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Customers
            </Link>
            <Link to="/employees" className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors">
              Employees
            </Link>
            <Button className="healthhub-button">
              Login
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
                to="/pharmacy" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Pharmacy
              </Link>
              <Link 
                to="/laboratory" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Laboratory
              </Link>
              <Link 
                to="/customers" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Customers
              </Link>
              <Link 
                to="/employees" 
                className="font-medium text-gray-700 hover:text-healthhub-orange transition-colors px-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                Employees
              </Link>
              <Button className="healthhub-button w-full">
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
