
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, startOfWeek, addDays, parseISO } from 'date-fns';
import { Doctor, DoctorSchedule } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';

interface AppointmentCalendarProps {
  doctor?: Doctor;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ doctor, onDateSelect, selectedDate }) => {
  // Fetch doctor schedules
  const { data: schedules } = useSupabaseQuery<DoctorSchedule>(
    'doctorschedule',
    {
      filters: (query) => (doctor ? query.eq('doctorid', doctor.doctorid) : query),
      enabled: !!doctor,
    }
  );

  // Fetch doctor leaves
  const { data: leaves } = useSupabaseQuery(
    'doctorleaves',
    {
      filters: (query) => (doctor ? query.eq('doctorid', doctor.doctorid).gte('startdate', format(new Date(), 'yyyy-MM-dd')) : query),
      enabled: !!doctor,
    }
  );

  // Function to check if doctor is available on a specific date based on schedule and leaves
  const isDoctorAvailable = (date: Date) => {
    if (!schedules || !leaves) return false;

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay() + 1; // In our DB 1 = Sunday, 7 = Saturday

    // Check if the doctor has a schedule for this day
    const hasSchedule = schedules.some(schedule => schedule.dayofweek === dayOfWeek && schedule.isactive);
    
    // Check if the doctor is on leave on this date
    const isOnLeave = leaves.some(leave => {
      const startDate = parseISO(leave.startdate);
      const endDate = parseISO(leave.enddate);
      return date >= startDate && date <= endDate && leave.status === 'Approved';
    });

    return hasSchedule && !isOnLeave;
  };

  // Function to render day contents with availability indicators
  const renderDayContent = (day: Date) => {
    const isAvailable = isDoctorAvailable(day);
    return (
      <div className={`w-full h-full flex items-center justify-center ${isAvailable ? 'text-primary' : 'text-gray-300'}`}>
        <span>{format(day, 'd')}</span>
        {isAvailable && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></span>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-2 md:p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-md border"
          disabled={(date) => 
            date < new Date() || // Disable past dates
            !isDoctorAvailable(date) // Disable unavailable dates
          }
          components={{
            DayContent: ({ date }) => renderDayContent(date)
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
