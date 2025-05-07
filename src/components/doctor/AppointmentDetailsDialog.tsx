
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, FileText, UserCheck, UserX, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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

interface AppointmentDetailsDialogProps {
  open: boolean;
  appointment: Appointment;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (status: string) => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  open,
  appointment,
  onOpenChange,
  onStatusUpdate
}) => {
  const [notes, setNotes] = useState(appointment.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const saveNotes = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('appointments')
      .update({ notes })
      .eq('appointmentid', appointment.appointmentid);
      
    setIsSaving(false);
    
    if (error) {
      toast.error('Failed to update appointment notes');
      console.error('Error updating appointment notes:', error);
      return;
    }
    
    toast.success('Appointment notes updated');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Appointment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{appointment.firstname} {appointment.lastname}</h3>
            {getStatusBadge(appointment.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(appointment.appointmentdate), 'MMMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {format(new Date(`2000-01-01T${appointment.appointmenttime}`), 'h:mm a')}
                {' · '}
                {appointment.duration} min
              </span>
            </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add notes about this appointment"
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              asChild 
              variant="outline" 
              className="justify-start"
            >
              <Link to={`/patients/${appointment.customerid}`}>
                <FileText className="mr-2 h-4 w-4" /> View Patient History
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="justify-start"
            >
              <Link to={`/prescriptions/new?patientId=${appointment.customerid}`}>
                <FileText className="mr-2 h-4 w-4" /> Write Prescription
              </Link>
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {appointment.status === 'Scheduled' && (
              <>
                <Button 
                  onClick={() => onStatusUpdate('Completed')}
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  size="sm"
                >
                  <UserCheck className="h-4 w-4 mr-1" /> Completed
                </Button>
                <Button 
                  onClick={() => onStatusUpdate('NoShow')}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700"
                  size="sm"
                >
                  <UserX className="h-4 w-4 mr-1" /> No Show
                </Button>
                <Button 
                  onClick={() => onStatusUpdate('Cancelled')}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            )}
          </div>
          
          <Button 
            onClick={saveNotes} 
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;
