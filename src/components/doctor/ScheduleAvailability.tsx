
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AvailabilitySettingsProps {
  scheduleData: any[];
  isLoading: boolean;
  refetchSchedule: () => void;
  onEditSchedule: (schedule: any) => void;
  onDeleteSchedule: (scheduleId: number) => void;
}

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleAvailability: React.FC<AvailabilitySettingsProps> = ({ 
  scheduleData,
  isLoading,
  refetchSchedule,
  onEditSchedule,
  onDeleteSchedule
}) => {
  const { userProfile } = useAuth();
  const [isAddingSchedule, setIsAddingSchedule] = React.useState(false);
  const [scheduleFormData, setScheduleFormData] = React.useState({
    dayofweek: '1',
    starttime: '09:00',
    endtime: '17:00',
    maxappointments: '8',
  });

  const handleScheduleChange = (field: string, value: string) => {
    setScheduleFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSchedule = async () => {
    try {
      const scheduleItem = {
        doctorid: userProfile?.doctorId,
        dayofweek: parseInt(scheduleFormData.dayofweek),
        starttime: scheduleFormData.starttime,
        endtime: scheduleFormData.endtime,
        maxappointments: parseInt(scheduleFormData.maxappointments),
        isactive: true
      };
      
      const { error } = await supabase
        .from('doctorschedule')
        .insert([scheduleItem]);
        
      if (error) throw error;
      
      toast.success('Schedule created successfully');
      setIsAddingSchedule(false);
      refetchSchedule();
      
      // Reset form
      setScheduleFormData({
        dayofweek: '1',
        starttime: '09:00',
        endtime: '17:00',
        maxappointments: '8',
      });
    } catch (error: any) {
      toast.error('Failed to create schedule');
      console.error('Error creating schedule:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regular Availability</CardTitle>
        <CardDescription>
          Set your regular working hours for each day of the week
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between">
            <Button 
              variant={isAddingSchedule ? "secondary" : "default"}
              onClick={() => setIsAddingSchedule(!isAddingSchedule)}
            >
              {isAddingSchedule ? 'Cancel' : 'Add New Schedule'}
            </Button>
          </div>
          
          {isAddingSchedule && (
            <Card className="border-dashed border-2 p-4">
              <CardContent className="p-0 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="day" className="text-sm font-medium">Day</label>
                    <Select
                      value={scheduleFormData.dayofweek}
                      onValueChange={(value) => handleScheduleChange('dayofweek', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Days</SelectLabel>
                          {weekdayNames.map((day, index) => (
                            <SelectItem key={index} value={(index + 1).toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="maxappts" className="text-sm font-medium">Max Appointments</label>
                    <Input
                      id="maxappts"
                      type="number"
                      min={1}
                      value={scheduleFormData.maxappointments}
                      onChange={(e) => handleScheduleChange('maxappointments', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="starttime" className="text-sm font-medium">Start Time</label>
                    <Input
                      id="starttime"
                      type="time"
                      value={scheduleFormData.starttime}
                      onChange={(e) => handleScheduleChange('starttime', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="endtime" className="text-sm font-medium">End Time</label>
                    <Input
                      id="endtime"
                      type="time"
                      value={scheduleFormData.endtime}
                      onChange={(e) => handleScheduleChange('endtime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={handleAddSchedule}>
                    Save Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-100 w-full rounded"></div>
              <div className="h-10 bg-gray-100 w-full rounded"></div>
            </div>
          ) : scheduleData?.length ? (
            <div className="space-y-4">
              {weekdayNames.map((day, index) => {
                const daySchedules = scheduleData.filter(s => s.dayofweek === index + 1);
                
                return (
                  <div key={index} className="border rounded-md p-4">
                    <div className="font-medium text-lg mb-2">{day}</div>
                    
                    {daySchedules.length > 0 ? (
                      <div className="space-y-2">
                        {daySchedules.map(schedule => (
                          <div key={schedule.scheduleid} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <span className="font-medium">{schedule.starttime.substring(0, 5)} - {schedule.endtime.substring(0, 5)}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                (Max: {schedule.maxappointments})
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onEditSchedule(schedule)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onDeleteSchedule(schedule.scheduleid)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No schedule set for this day</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No schedule has been set. Click "Add New Schedule" to create your availability.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleAvailability;
