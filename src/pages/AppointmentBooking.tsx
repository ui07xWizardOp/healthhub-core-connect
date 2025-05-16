
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Doctor } from '@/types/supabase';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';

// Import components
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import TimeSlotSelector from '@/components/appointments/TimeSlotSelector';
import AppointmentManager from '@/components/appointments/AppointmentManager';

const AppointmentBooking = () => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('book');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch doctors data
  const { data: doctors, isLoading: isLoadingDoctors } = useSupabaseQuery<Doctor>(
    'doctors',
    {
      filters: (query) => query.eq('isactive', true),
    }
  );

  // Set first doctor as default when data is loaded
  useEffect(() => {
    if (doctors && doctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctors[0].doctorid);
    }
  }, [doctors, selectedDoctor]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(Number(doctorId));
  };

  const refreshAppointments = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const selectedDoctorData = doctors?.find(doctor => doctor.doctorid === selectedDoctor);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Appointment System</h1>
            <p className="text-gray-600">Book and manage your appointments</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="manage">Manage Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Select Doctor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDoctors ? (
                      <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
                    ) : (
                      <Select
                        value={selectedDoctor?.toString() || ''}
                        onValueChange={handleDoctorChange}
                        disabled={!doctors || doctors.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors?.map(doctor => (
                            <SelectItem 
                              key={doctor.doctorid} 
                              value={doctor.doctorid.toString()}
                            >
                              Dr. {doctor.firstname} {doctor.lastname} - {doctor.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                <AppointmentCalendar 
                  doctor={selectedDoctorData}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>

              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </CardTitle>
                    {selectedDoctorData && (
                      <CardDescription>
                        Dr. {selectedDoctorData.firstname} {selectedDoctorData.lastname} - {selectedDoctorData.specialization}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {selectedDoctor && (
                      <TimeSlotSelector 
                        doctorId={selectedDoctor}
                        selectedDate={selectedDate}
                        refreshAppointments={refreshAppointments}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <AppointmentManager 
              mode="patient"
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentBooking;
