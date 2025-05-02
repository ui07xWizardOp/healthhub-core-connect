
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClipboardListIcon, TestTubeIcon, PillIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  linkTo: string;
  buttonText: string;
}> = ({ icon, title, description, linkTo, buttonText }) => {
  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="h-12 w-12 rounded-full bg-healthhub-blue/10 flex items-center justify-center text-healthhub-blue mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base text-gray-600">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-healthhub-orange text-white hover:bg-healthhub-orange/90">
          <Link to={linkTo}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const ServicesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white" id="services">
      <div className="healthhub-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Healthcare Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive healthcare services to meet all your medical needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon={<CalendarIcon size={24} />}
            title="Book a Checkup"
            description="Schedule appointments with our experienced doctors. Check available slots and book your consultation."
            linkTo="/signup"
            buttonText="Book Now"
          />
          <ServiceCard
            icon={<TestTubeIcon size={24} />}
            title="Lab Tests"
            description="Browse our catalog of diagnostic tests with transparent pricing. Book your test with just a few clicks."
            linkTo="/signup"
            buttonText="View Tests"
          />
          <ServiceCard
            icon={<PillIcon size={24} />}
            title="Pharmacy"
            description="Order prescribed medications and have them delivered to your doorstep or pick up at your convenience."
            linkTo="/signup"
            buttonText="Explore"
          />
          <ServiceCard
            icon={<ClipboardListIcon size={24} />}
            title="Health Records"
            description="Access your medical history, test results, and prescriptions securely from anywhere."
            linkTo="/signup"
            buttonText="Learn More"
          />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
