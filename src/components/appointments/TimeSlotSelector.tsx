
import React, { useState, useEffect } from 'react';
import { format, parseISO, addMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/supabase';

interface TimeSlotSelectorProps {
  doctorId: number;
  selectedDate: Date;
  refreshAppointments: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ 
  doctorId, 
  selectedDate,
  refreshAppointments
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // Fetch available slots for the selected date
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!doctorId || !selectedDate) {
        setTimeSlots([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get doctor's schedule for this day of week
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('doctorschedule')
          .select('*')
          .eq('doctorid', doctorId)
          .eq('dayofweek', selectedDate.getDay() + 1) // +1 because in our DB 1 = Sunday, 7 = Saturday
          .eq('isactive', true);

        if (scheduleError) throw scheduleError;
        if (!scheduleData || scheduleData.length === 0) {
          setTimeSlots([]);
          setLoading(false);
          return;
        }

        const schedule = scheduleData[0];
        const startTime = parseISO(`2000-01-01T${schedule.starttime}`);
        const endTime = parseISO(`2000-01-01T${schedule.endtime}`);
        
        // Generate time slots every 30 mins
        const slots = [];
        let currentTime = startTime;
        
        while (currentTime < endTime) {
          slots.push({
            time: format(currentTime, 'HH:mm'),
            available: true
          });
          
          currentTime = addMinutes(currentTime, 30);
        }

        // Check existing appointments to mark slots as unavailable
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctorid', doctorId)
          .eq('appointmentdate', formattedDate)
          .in('status', ['Scheduled', 'Confirmed']);

        if (appointmentError) throw appointmentError;

        // Mark booked slots as unavailable
        const updatedSlots = slots.map(slot => {
          const isBooked = appointmentData?.some(
            appointment => format(parseISO(`2000-01-01T${appointment.appointmenttime}`), 'HH:mm') === slot.time
          );
          return {
            ...slot,
            available: !isBooked
          };
        });

        setTimeSlots(updatedSlots);
      } catch (error: any) {
        console.error('Error fetching time slots:', error);
        toast({
          title: 'Error fetching time slots',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [doctorId, selectedDate, toast]);

  // Function to book an appointment
  const bookAppointment = async (time: string) => {
    if (!userProfile?.userId) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to book an appointment',
        variant: 'destructive'
      });
      return;
    }

    setBookingSlot(time);

    try {
      const appointment: Partial<Appointment> = {
        customerid: userProfile.userId,
        doctorid: doctorId,
        appointmentdate: format(selectedDate, 'yyyy-MM-dd'),
        appointmenttime: time,
        duration: 30,
        status: 'Scheduled',
        bookingdatetime: new Date().toISOString(),
        bookedby: userProfile.userId,
        paymentstatus: 'Pending'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select('*')
        .single();

      if (error) throw error;

      toast({
        title: 'Appointment booked',
        description: `Your appointment is scheduled for ${format(selectedDate, 'MMMM d, yyyy')} at ${time}`,
      });
      
      // Refresh appointment list
      refreshAppointments();

      // Update the time slots to mark this one as unavailable
      setTimeSlots(prevSlots => prevSlots.map(slot => 
        slot.time === time ? { ...slot, available: false } : slot
      ));
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setBookingSlot(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeSlots.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No time slots available for this date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Time Slots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {timeSlots.map((slot, index) => (
            <Button
              key={index}
              variant={slot.available ? 'outline' : 'ghost'}
              className={`${!slot.available && 'opacity-50 cursor-not-allowed'}`}
              disabled={!slot.available || bookingSlot !== null}
              onClick={() => slot.available && bookAppointment(slot.time)}
            >
              {bookingSlot === slot.time ? (
                <span className="animate-pulse">Booking...</span>
              ) : (
                slot.time
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
