
import React, { useState, useEffect } from 'react';
import { format, isBefore } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, Doctor, User } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';

interface AppointmentManagerProps {
  mode: 'patient' | 'doctor';
  refreshTrigger?: number;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ mode, refreshTrigger = 0 }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [currentAppointments, setCurrentAppointments] = useState<any[]>([]);

  const { data: appointments, isLoading, error } = useSupabaseQuery<Appointment>(
    'appointments',
    {
      filters: (query) => {
        let filteredQuery = query;
        if (mode === 'patient' && userProfile?.userId) {
          filteredQuery = filteredQuery.eq('customerid', userProfile.userId);
        } else if (mode === 'doctor' && userProfile?.doctorId) {
          filteredQuery = filteredQuery.eq('doctorid', userProfile.doctorId);
        }
        
        // Only show non-cancelled appointments by default
        filteredQuery = filteredQuery.neq('status', 'Cancelled');
        
        return filteredQuery.order('appointmentdate', { ascending: true })
          .order('appointmenttime', { ascending: true });
      },
      enabled: !!userProfile,
    }
  );

  // Fetch users and doctors to get names
  const { data: users } = useSupabaseQuery<User>('users');
  const { data: doctors } = useSupabaseQuery<Doctor>('doctors');
  
  // Setup realtime subscription for appointments
  useEffect(() => {
    if (!userProfile) return;

    const appointmentsChannel = supabase
      .channel('appointment-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: mode === 'patient' && userProfile?.userId ? 
            `customerid=eq.${userProfile.userId}` : 
            (mode === 'doctor' && userProfile?.doctorId ? 
              `doctorid=eq.${userProfile.doctorId}` : undefined)
        }, 
        () => {
          // Refresh appointments data when there's a change
          supabase.from('appointments')
            .select('*')
            .then(({ data }) => {
              if (data) processAppointments(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, [userProfile, mode]);

  // Process appointments with user and doctor data
  useEffect(() => {
    if (appointments && users && doctors) {
      processAppointments(appointments);
    }
  }, [appointments, users, doctors, refreshTrigger]);

  const processAppointments = (appointmentsData: Appointment[]) => {
    const processed = appointmentsData.map(appointment => {
      const doctor = doctors?.find(d => d.doctorid === appointment.doctorid);
      const patient = users?.find(u => u.userid === appointment.customerid);
      
      return {
        ...appointment,
        doctorName: doctor ? `Dr. ${doctor.firstname} ${doctor.lastname}` : 'Unknown Doctor',
        patientName: patient ? `${patient.firstname} ${patient.lastname}` : 'Unknown Patient',
        isPast: isBefore(new Date(`${appointment.appointmentdate} ${appointment.appointmenttime}`), new Date()),
      };
    });
    
    // Sort by date & time
    processed.sort((a, b) => {
      const dateA = new Date(`${a.appointmentdate} ${a.appointmenttime}`);
      const dateB = new Date(`${b.appointmentdate} ${b.appointmenttime}`);
      return dateA.getTime() - dateB.getTime();
    });

    setCurrentAppointments(processed);
  };

  const cancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setCancelLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('appointmentid', selectedAppointment.appointmentid);
      
      if (error) throw error;
      
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: 'Appointment cancelled',
        description: 'The appointment has been cancelled successfully.',
      });

      // Update the appointments list
      if (appointments) {
        const updatedAppointments = appointments.map(apt => {
          if (apt.appointmentid === selectedAppointment.appointmentid) {
            return { ...apt, status: 'Cancelled' };
          }
          return apt;
        });
        processAppointments(updatedAppointments);
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: `Failed to cancel the appointment: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Scheduled</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
      case 'NoShow':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading appointments</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'patient' ? 'Your Appointments' : 'Patient Appointments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {mode === 'patient' 
                ? "You don't have any appointments scheduled." 
                : "There are no appointments scheduled."}
            </div>
          ) : (
            <div className="space-y-4">
              {currentAppointments.map((appointment) => (
                <Card key={appointment.appointmentid} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="text-center bg-white p-2 rounded border flex flex-col items-center min-w-[70px]">
                          <Calendar className="h-4 w-4 mb-1" />
                          <div className="text-sm font-semibold">{format(new Date(appointment.appointmentdate), 'MMM d')}</div>
                          <div className="text-xs text-gray-500">{format(new Date(appointment.appointmentdate), 'yyyy')}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {format(new Date(`2000-01-01T${appointment.appointmenttime}`), 'h:mm a')}
                            </span>
                          </div>
                          
                          {mode === 'patient' ? (
                            <h3 className="font-medium mt-1">{appointment.doctorName}</h3>
                          ) : (
                            <h3 className="font-medium mt-1">{appointment.patientName}</h3>
                          )}
                          
                          <div className="flex gap-2 items-center mt-1">
                            {getStatusBadge(appointment.status)}
                            
                            {appointment.appointmentdate && !appointment.isPast && appointment.status !== 'Cancelled' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                cancelAppointment();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Appointment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentManager;
