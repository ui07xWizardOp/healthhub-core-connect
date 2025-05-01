
import React from 'react';
import FeatureCard from './FeatureCard';
import { Medication, Flask, Users, UserCircle } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white" id="features">
      <div className="healthhub-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Healthcare Management</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform offers a complete solution for managing all aspects of your pharmacy and laboratory operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Medication size={24} />}
            title="Pharmacy Management"
            description="Manage inventory, prescriptions, and orders with our comprehensive pharmacy module."
          />
          <FeatureCard
            icon={<Flask size={24} />}
            title="Lab Management"
            description="Keep track of tests, results, and samples with our laboratory information system."
          />
          <FeatureCard
            icon={<Users size={24} />}
            title="Customer Management"
            description="Maintain customer profiles, prescription history, and test results in one place."
          />
          <FeatureCard
            icon={<UserCircle size={24} />}
            title="Employee Management"
            description="Manage staff roles, permissions, and schedules efficiently."
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
