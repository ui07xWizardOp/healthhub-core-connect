
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TestResultViewer from '@/components/results/TestResultViewer';

const TestResultsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">My Test Results</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              View your past and present laboratory test results.
            </p>
          </div>
          <TestResultViewer />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestResultsPage;
