
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LabTestsList from '@/components/laboratory/LabTestsList';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart } from 'lucide-react';
import { useLabTestCart } from '@/contexts/LabTestCartContext';
import { Link } from 'react-router-dom';

const LabTests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cartCount } = useLabTestCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Lab Tests</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse our comprehensive catalog of diagnostic tests. All tests are performed in our state-of-the-art facility.
            </p>
          </div>
          <div className="mb-8 max-w-2xl mx-auto flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for a lab test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Button asChild>
              <Link to="/lab-tests/book" className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 bg-healthhub-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
          <LabTestsList searchTerm={searchTerm} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabTests;
