
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { format, isSameDay, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Clock, 
  Plus, 
  Edit, 
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import ScheduleAvailability from './ScheduleAvailability';
import LeaveManagement from './LeaveManagement';
import EmergencyAvailability from './EmergencyAvailability';

interface ScheduleItem {
  scheduleid: number;
  dayofweek: number;
  starttime: string;
  endtime: string;
  maxappointments: number;
}

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    dayofweek: '1',
    starttime: '09:00',
    endtime: '17:00',
    maxappointments: '8',
  });
  const [activeTab, setActiveTab] = useState('availability');
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

  // Fetch doctor's schedule
  const { 
    data: scheduleData, 
    isLoading: scheduleLoading,
    refetch: refetchSchedule
  } = useQuery({
    queryKey: ['doctor-schedule', userProfile?.doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctorschedule')
        .select('*')
        .eq('doctorid', userProfile?.doctorId)
        .eq('isactive', true)
        .order('dayofweek', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId
  });

  // Handle edit schedule
  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingScheduleId(schedule.scheduleid);
    setScheduleFormData({
      dayofweek: schedule.dayofweek.toString(),
      starttime: schedule.starttime,
      endtime: schedule.endtime,
      maxappointments: schedule.maxappointments.toString(),
    });
    setIsScheduleDialogOpen(true);
  };
  
  // Delete schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const { error } = await supabase
        .from('doctorschedule')
        .update({ isactive: false })
        .eq('scheduleid', scheduleId);
      
      if (error) throw error;
      
      toast.success('Schedule deleted successfully');
      refetchSchedule();
    } catch (error) {
      toast.error('Failed to delete schedule');
      console.error('Error deleting schedule:', error);
    }
  };
  
  // Save schedule
  const handleSaveSchedule = async () => {
    try {
      const scheduleItem = {
        doctorid: userProfile?.doctorId,
        dayofweek: parseInt(scheduleFormData.dayofweek),
        starttime: scheduleFormData.starttime,
        endtime: scheduleFormData.endtime,
        maxappointments: parseInt(scheduleFormData.maxappointments),
        isactive: true
      };
      
      let error;
      
      if (editingScheduleId) {
        // Update existing schedule
        const response = await supabase
          .from('doctorschedule')
          .update(scheduleItem)
          .eq('scheduleid', editingScheduleId);
          
        error = response.error;
      } else {
        // Create new schedule
        const response = await supabase
          .from('doctorschedule')
          .insert([scheduleItem]);
          
        error = response.error;
      }
      
      if (error) throw error;
      
      toast.success(`Schedule ${editingScheduleId ? 'updated' : 'created'} successfully`);
      setIsScheduleDialogOpen(false);
      setEditingScheduleId(null);
      refetchSchedule();
      
      // Reset form
      setScheduleFormData({
        dayofweek: '1',
        starttime: '09:00',
        endtime: '17:00',
        maxappointments: '8',
      });
    } catch (error) {
      toast.error(`Failed to ${editingScheduleId ? 'update' : 'create'} schedule`);
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="availability">Regular Availability</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="availability" className="mt-6">
          <ScheduleAvailability
            scheduleData={scheduleData || []}
            isLoading={scheduleLoading}
            refetchSchedule={refetchSchedule}
            onEditSchedule={handleEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        </TabsContent>
        
        <TabsContent value="leaves" className="mt-6">
          <LeaveManagement />
        </TabsContent>
        
        <TabsContent value="emergency" className="mt-6">
          <EmergencyAvailability />
        </TabsContent>
      </Tabs>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingScheduleId ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
            <DialogDescription>
              Set your regular working hours for specific days of the week
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="day" className="text-right">Day</label>
              <Select
                value={scheduleFormData.dayofweek}
                onValueChange={(value) => setScheduleFormData(prev => ({ ...prev, dayofweek: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {weekdayNames.map((day, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="starttime" className="text-right">Start Time</label>
              <Input
                id="starttime"
                type="time"
                value={scheduleFormData.starttime}
                onChange={(e) => setScheduleFormData(prev => ({ ...prev, starttime: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="endtime" className="text-right">End Time</label>
              <Input
                id="endtime"
                type="time"
                value={scheduleFormData.endtime}
                onChange={(e) => setScheduleFormData(prev => ({ ...prev, endtime: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="maxappts" className="text-right">Max Appointments</label>
              <Input
                id="maxappts"
                type="number"
                min={1}
                value={scheduleFormData.maxappointments}
                onChange={(e) => setScheduleFormData(prev => ({ ...prev, maxappointments: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsScheduleDialogOpen(false);
              setEditingScheduleId(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              {editingScheduleId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagement;
