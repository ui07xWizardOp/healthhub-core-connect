
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
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import { format, isSameDay, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit, 
  Trash, 
  Calendar as CalendarDaysIcon 
} from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleItem {
  scheduleid: number;
  dayofweek: number;
  starttime: string;
  endtime: string;
  maxappointments: number;
}

interface LeaveItem {
  leaveid: number;
  startdate: string;
  enddate: string;
  reason?: string;
  status: string;
}

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    dayofweek: '1',
    starttime: '09:00',
    endtime: '17:00',
    maxappointments: '8',
  });
  const [leaveFormData, setLeaveFormData] = useState({
    startdate: format(new Date(), 'yyyy-MM-dd'),
    enddate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  });
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

  // Fetch doctor's leaves
  const { 
    data: leavesData, 
    isLoading: leavesLoading,
    refetch: refetchLeaves
  } = useQuery({
    queryKey: ['doctor-leaves', userProfile?.doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctorleaves')
        .select('*')
        .eq('doctorid', userProfile?.doctorId)
        .gte('enddate', new Date().toISOString())  // Only get current and future leaves
        .order('startdate', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId
  });
  
  // Check if a date is within any leave period
  const isLeaveDay = (date: Date) => {
    if (!leavesData) return false;
    
    return leavesData.some(leave => {
      const startDate = parseISO(leave.startdate);
      const endDate = parseISO(leave.enddate);
      return isWithinInterval(date, { start: startDate, end: endDate }) && leave.status === 'Approved';
    });
  };
  
  // Get weekly schedule view
  const getWeekSchedule = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Day</TableHead>
              <TableHead>Schedule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weekDays.map((day, index) => {
              const daySchedules = scheduleData?.filter(s => s.dayofweek === index + 1) || [];
              const isLeave = isLeaveDay(day);
              
              return (
                <TableRow key={index} className={isSameDay(day, selectedDate) ? 'bg-blue-50' : ''}>
                  <TableCell className="font-medium">
                    <div>{weekdayNames[index]}</div>
                    <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                  </TableCell>
                  <TableCell>
                    {isLeave ? (
                      <div className="text-orange-500 font-medium">On Leave</div>
                    ) : daySchedules.length > 0 ? (
                      <div className="space-y-1">
                        {daySchedules.map(schedule => (
                          <div key={schedule.scheduleid} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>
                                {format(new Date(`2000-01-01T${schedule.starttime}`), 'h:mm a')} - 
                                {format(new Date(`2000-01-01T${schedule.endtime}`), 'h:mm a')}
                              </span>
                              <span className="text-sm text-gray-500">
                                (Max: {schedule.maxappointments})
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.scheduleid)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No schedule set</div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Handle schedule form data change
  const handleScheduleChange = (field: string, value: string) => {
    setScheduleFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle leave form data change
  const handleLeaveChange = (field: string, value: string) => {
    setLeaveFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Edit schedule
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
  
  // Request leave
  const handleRequestLeave = async () => {
    try {
      const leaveItem = {
        doctorid: userProfile?.doctorId,
        startdate: leaveFormData.startdate,
        enddate: leaveFormData.enddate,
        reason: leaveFormData.reason,
        status: 'Pending'
      };
      
      const { error } = await supabase
        .from('doctorleaves')
        .insert([leaveItem]);
      
      if (error) throw error;
      
      toast.success('Leave request submitted successfully');
      setIsLeaveDialogOpen(false);
      refetchLeaves();
      
      // Reset form
      setLeaveFormData({
        startdate: format(new Date(), 'yyyy-MM-dd'),
        enddate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
      });
    } catch (error) {
      toast.error('Failed to submit leave request');
      console.error('Error requesting leave:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Manage your regular working hours</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "MMMM d, yyyy")}
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
                
                <div className="flex gap-2">
                  <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                      </Button>
                    </DialogTrigger>
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
                            onValueChange={(value) => handleScheduleChange('dayofweek', value)}
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
                            onChange={(e) => handleScheduleChange('starttime', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="endtime" className="text-right">End Time</label>
                          <Input
                            id="endtime"
                            type="time"
                            value={scheduleFormData.endtime}
                            onChange={(e) => handleScheduleChange('endtime', e.target.value)}
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
                            onChange={(e) => handleScheduleChange('maxappointments', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSchedule}>
                          {editingScheduleId ? 'Update' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {scheduleLoading ? (
                <div className="animate-pulse">
                  <div className="h-[300px] bg-gray-100 w-full rounded"></div>
                </div>
              ) : (
                getWeekSchedule()
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Leave Management</CardTitle>
            <CardDescription>Request and manage time off</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                  <DialogDescription>
                    Submit a request for time off from your schedule
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="startdate" className="text-right">Start Date</label>
                    <Input
                      id="startdate"
                      type="date"
                      value={leaveFormData.startdate}
                      onChange={(e) => handleLeaveChange('startdate', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="enddate" className="text-right">End Date</label>
                    <Input
                      id="enddate"
                      type="date"
                      value={leaveFormData.enddate}
                      onChange={(e) => handleLeaveChange('enddate', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="reason" className="text-right">Reason</label>
                    <Input
                      id="reason"
                      value={leaveFormData.reason}
                      onChange={(e) => handleLeaveChange('reason', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRequestLeave}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Upcoming Leaves</h3>
              
              {leavesLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-100 w-full rounded"></div>
                  <div className="h-10 bg-gray-100 w-full rounded"></div>
                </div>
              ) : leavesData && leavesData.length > 0 ? (
                <div className="space-y-2">
                  {leavesData.map((leave) => (
                    <Card key={leave.leaveid} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">
                              {format(new Date(leave.startdate), 'MMM d')} - {format(new Date(leave.enddate), 'MMM d, yyyy')}
                            </div>
                            {leave.reason && (
                              <div className="text-sm text-gray-600">{leave.reason}</div>
                            )}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${
                              leave.status === 'Approved' ? 'text-green-600' :
                              leave.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {leave.status}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No upcoming leaves
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleManagement;
