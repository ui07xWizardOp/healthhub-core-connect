
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LabTestsList from '@/components/laboratory/LabTestsList';

const LabTests: React.FC = () => {
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
          <LabTestsList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabTests;
