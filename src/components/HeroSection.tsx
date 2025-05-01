
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-healthhub-white via-healthhub-blue/10 to-healthhub-peach/20 py-16 md:py-24">
      <div className="healthhub-container">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:max-w-2xl space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
              Manage Your Pharmacy & Lab with Ease
            </h1>
            <p className="text-xl text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              HealthHub provides a comprehensive solution for managing pharmacy operations,
              laboratory services, customers, and employees all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button asChild className="healthhub-button">
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" asChild className="border-healthhub-orange text-healthhub-orange hover:bg-healthhub-orange/10">
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 w-full lg:w-1/2 flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="relative">
              <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-healthhub-yellow/30 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-healthhub-blue/30 rounded-full blur-3xl"></div>
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <img
                  src="/placeholder.svg"
                  alt="HealthHub Dashboard"
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
