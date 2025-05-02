import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';
const Footer: React.FC = () => {
  return <footer className="bg-white border-t border-gray-200">
      <div className="healthhub-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <Logo />
            <p className="mt-4 text-gray-600">
              Manage your pharmacy and lab operations with ease.
            </p>
          </div>
          
          
          
          
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-healthhub-orange transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-healthhub-orange transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-healthhub-orange transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-healthhub-orange transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} HealthHub. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="#" className="text-gray-600 hover:text-healthhub-orange transition-colors">
              Facebook
            </Link>
            <Link to="#" className="text-gray-600 hover:text-healthhub-orange transition-colors">
              Twitter
            </Link>
            <Link to="#" className="text-gray-600 hover:text-healthhub-orange transition-colors">
              LinkedIn
            </Link>
            <Link to="#" className="text-gray-600 hover:text-healthhub-orange transition-colors">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;