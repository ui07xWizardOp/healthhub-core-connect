
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar as CalendarIcon, Clock, UserCheck, UserX, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';

type Appointment = {
  appointmentid: number;
  customerid: number;
  firstname: string;
  lastname: string;
  appointmentdate: string;
  appointmenttime: string;
  duration: number;
  status: string;
  notes?: string;
};

const AppointmentManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);

  // Fetch doctor's appointments
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['doctor-appointments', userProfile?.doctorId, format(selectedDate, 'yyyy-MM-dd'), statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          appointmentid,
          customerid,
          appointmentdate,
          appointmenttime,
          duration,
          status,
          notes,
          users:customerid (
            firstname,
            lastname
          )
        `)
        .eq('doctorid', userProfile?.doctorId)
        .eq('appointmentdate', format(selectedDate, 'yyyy-MM-dd'));
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('appointmenttime');
      
      if (error) throw error;
      
      return data?.map(appt => ({
        appointmentid: appt.appointmentid,
        customerid: appt.customerid,
        firstname: appt.users?.firstname || 'Unknown',
        lastname: appt.users?.lastname || 'Patient',
        appointmentdate: appt.appointmentdate,
        appointmenttime: appt.appointmenttime,
        duration: appt.duration,
        status: appt.status,
        notes: appt.notes,
      })) || [];
    },
    enabled: !!userProfile?.doctorId
  });

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('appointmentid', appointmentId);
      
    if (error) {
      toast.error('Failed to update appointment status');
      console.error('Error updating appointment status:', error);
      return false;
    }
    
    toast.success(`Appointment marked as ${status}`);
    refetch();
    return true;
  };

  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>View and manage your patient appointments</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full md:w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="NoShow">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 w-[150px] bg-gray-200 rounded"></div>
                        <div className="h-3 w-[100px] bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-6 w-[80px] bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <Card key={appointment.appointmentid} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-center bg-white p-2 rounded border w-16">
                          <div className="text-sm font-semibold">{format(new Date(`2000-01-01T${appointment.appointmenttime}`), 'h:mm')}</div>
                          <div className="text-xs">{format(new Date(`2000-01-01T${appointment.appointmenttime}`), 'a')}</div>
                        </div>
                        <div>
                          <h3 className="font-medium">{`${appointment.firstname} ${appointment.lastname}`}</h3>
                          <div className="flex items-center text-sm text-gray-600 gap-2">
                            <Clock className="h-3 w-3" /> {appointment.duration} min
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        
                        <div className="flex items-center ml-2 gap-1">
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewAppointmentDetails(appointment)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {appointment.status === 'Scheduled' && (
                            <>
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.appointmentid, 'Completed')}
                                title="Mark as Completed"
                              >
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.appointmentid, 'NoShow')}
                                title="Mark as No Show"
                              >
                                <UserX className="h-4 w-4 text-orange-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No appointments found for this day.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedAppointment && (
        <AppointmentDetailsDialog
          open={isAppointmentDetailsOpen}
          appointment={selectedAppointment}
          onOpenChange={setIsAppointmentDetailsOpen}
          onStatusUpdate={(status) => updateAppointmentStatus(selectedAppointment.appointmentid, status)}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
