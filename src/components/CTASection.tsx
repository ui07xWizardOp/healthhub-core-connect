
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-healthhub-peach/30 to-healthhub-blue/30">
      <div className="healthhub-container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Healthcare Journey Today</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Join our healthcare platform to book appointments, track health records, and manage your family's healthcare needs in one secure place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="healthhub-button">
            <Link to="/signup">Create Account</Link>
          </Button>
          <Button variant="outline" asChild className="border-healthhub-orange text-healthhub-orange hover:bg-healthhub-orange/10">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
