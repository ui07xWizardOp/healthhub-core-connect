
import React from 'react';

const StatisticsSection: React.FC = () => {
  return (
    <section className="py-16 bg-healthhub-blue/10">
      <div className="healthhub-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HealthHub</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who trust HealthHub to streamline their operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="healthhub-stat-card text-center">
            <div className="text-4xl font-bold text-healthhub-orange mb-2">500+</div>
            <div className="text-gray-600">Pharmacies</div>
          </div>
          
          <div className="healthhub-stat-card text-center">
            <div className="text-4xl font-bold text-healthhub-orange mb-2">300+</div>
            <div className="text-gray-600">Laboratories</div>
          </div>
          
          <div className="healthhub-stat-card text-center">
            <div className="text-4xl font-bold text-healthhub-orange mb-2">1M+</div>
            <div className="text-gray-600">Prescriptions Processed</div>
          </div>
          
          <div className="healthhub-stat-card text-center">
            <div className="text-4xl font-bold text-healthhub-orange mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
