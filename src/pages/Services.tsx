
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServicesSection from '@/components/ServicesSection';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Services</h1>
          <p className="text-lg text-center text-gray-600 mb-12">
            We offer a wide range of pharmacy, clinic, and lab services to meet your health needs.
          </p>
          <ServicesSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
