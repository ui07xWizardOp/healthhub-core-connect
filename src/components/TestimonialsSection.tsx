
import React from 'react';

const testimonials = [
  {
    quote: "HealthHub has transformed how we manage our pharmacy. The inventory tracking and prescription management features have saved us countless hours.",
    author: "Dr. Sarah Johnson",
    role: "Pharmacy Owner",
  },
  {
    quote: "As a lab manager, the test management system in HealthHub has been a game changer. We can now process results faster and communicate with patients more effectively.",
    author: "Michael Chen",
    role: "Laboratory Director",
  },
  {
    quote: "The customer management features have helped us provide more personalized care. Our patients appreciate how we can easily access their history.",
    author: "Rebecca Williams",
    role: "Healthcare Administrator",
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="healthhub-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from healthcare professionals who have transformed their operations with HealthHub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="healthhub-card p-6">
              <div className="flex items-start mb-4">
                <div className="text-4xl text-healthhub-peach">"</div>
              </div>
              <p className="text-gray-600 mb-6">{testimonial.quote}</p>
              <div className="mt-auto">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
