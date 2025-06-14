
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LabTestsList from '@/components/laboratory/LabTestsList';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const LabTests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className="mb-8 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for a lab test by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <LabTestsList searchTerm={searchTerm} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabTests;
