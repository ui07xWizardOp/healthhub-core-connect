
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorList from '@/components/appointments/DoctorList';
import { Doctor } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import TimeSlotSelector from '@/components/appointments/TimeSlotSelector';

const AppointmentBookingPage: React.FC = () => {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 md:py-20 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Book an Appointment</h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                          {!selectedDoctor 
                            ? "Select a doctor to view their availability and book a slot."
                            : `Booking an appointment with Dr. ${selectedDoctor.firstname} ${selectedDoctor.lastname}`
                          }
                        </p>
                    </div>

                    {!selectedDoctor ? (
                        <DoctorList onSelectDoctor={setSelectedDoctor} />
                    ) : (
                        <div className="max-w-7xl mx-auto">
                          <Button variant="outline" onClick={() => setSelectedDoctor(null)} className="mb-8">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Doctors
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <div className="md:col-span-1">
                                <AppointmentCalendar
                                    doctor={selectedDoctor}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <TimeSlotSelector
                                    doctorId={selectedDoctor.doctorid}
                                    selectedDate={selectedDate}
                                    refreshAppointments={() => {
                                        // Future enhancement: could refetch a list of user's appointments
                                    }}
                                />
                            </div>
                          </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default AppointmentBookingPage;
