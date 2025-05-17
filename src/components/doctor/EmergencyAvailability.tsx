
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, Clock, Plus } from 'lucide-react';

// Mock interface for emergency slots - will need to be added to the database
interface EmergencySlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxPatients: number;
}

const EmergencyAvailability: React.FC = () => {
  const { userProfile } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [emergencyEnabled, setEmergencyEnabled] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyFormData, setEmergencyFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '12:00',
    maxPatients: '3',
  });
  
  // This would use a real API endpoint in a production app
  const [emergencySlots, setEmergencySlots] = useState<EmergencySlot[]>([
    {
      id: 1,
      doctorId: userProfile?.doctorId || 0,
      date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
      startTime: '08:00',
      endTime: '12:00',
      isActive: true,
      maxPatients: 3
    }
  ]);
  
  const handleEmergencyFormChange = (field: string, value: string) => {
    setEmergencyFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddEmergencySlot = () => {
    // In a real app, this would save to the database
    const newSlot: EmergencySlot = {
      id: Date.now(), // Use proper ID in real app
      doctorId: userProfile?.doctorId || 0,
      date: emergencyFormData.date,
      startTime: emergencyFormData.startTime,
      endTime: emergencyFormData.endTime,
      isActive: true,
      maxPatients: parseInt(emergencyFormData.maxPatients)
    };
    
    setEmergencySlots(prev => [...prev, newSlot]);
    setShowEmergencyForm(false);
    toast.success('Emergency slot added successfully');
    
    // Reset form
    setEmergencyFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '08:00',
      endTime: '12:00',
      maxPatients: '3',
    });
  };
  
  const toggleEmergencyAvailability = (enable: boolean) => {
    // In a real app, this would update doctor's status in the database
    setEmergencyEnabled(enable);
    
    if (enable) {
      toast.success('Emergency availability enabled');
    } else {
      toast.info('Emergency availability disabled');
    }
  };
  
  const toggleSlotStatus = (slotId: number, isActive: boolean) => {
    // In a real app, this would update the database
    setEmergencySlots(prev => 
      prev.map(slot => 
        slot.id === slotId ? { ...slot, isActive } : slot
      )
    );
    
    toast.success(`Slot ${isActive ? 'activated' : 'deactivated'} successfully`);
  };
  
  const deleteEmergencySlot = (slotId: number) => {
    // In a real app, this would delete from the database
    setEmergencySlots(prev => prev.filter(slot => slot.id !== slotId));
    toast.success('Emergency slot deleted');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Availability</CardTitle>
        <CardDescription>
          Manage your availability for emergency appointments
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emergency-toggle">Emergency Availability Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable this to make yourself available for emergency appointments
              </p>
            </div>
            <Switch
              id="emergency-toggle"
              checked={emergencyEnabled}
              onCheckedChange={toggleEmergencyAvailability}
            />
          </div>
          
          {emergencyEnabled && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Emergency Slots</h3>
                <Button onClick={() => setShowEmergencyForm(!showEmergencyForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {showEmergencyForm ? 'Cancel' : 'Add Slot'}
                </Button>
              </div>
              
              {showEmergencyForm && (
                <Card className="border-dashed border-2">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency-date">Date</Label>
                        <Input
                          id="emergency-date"
                          type="date"
                          value={emergencyFormData.date}
                          onChange={(e) => handleEmergencyFormChange('date', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency-max">Maximum Patients</Label>
                        <Input
                          id="emergency-max"
                          type="number"
                          min="1"
                          value={emergencyFormData.maxPatients}
                          onChange={(e) => handleEmergencyFormChange('maxPatients', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency-start">Start Time</Label>
                        <Input
                          id="emergency-start"
                          type="time"
                          value={emergencyFormData.startTime}
                          onChange={(e) => handleEmergencyFormChange('startTime', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency-end">End Time</Label>
                        <Input
                          id="emergency-end"
                          type="time"
                          value={emergencyFormData.endTime}
                          onChange={(e) => handleEmergencyFormChange('endTime', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleAddEmergencySlot}>
                        Save Emergency Slot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {emergencySlots.length > 0 ? (
                <div className="space-y-4">
                  {emergencySlots.map((slot) => (
                    <Card key={slot.id} className={`bg-gray-50 ${!slot.isActive && 'opacity-70'}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <div className="font-medium">
                              {format(parseISO(slot.date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.startTime} - {slot.endTime} ({slot.maxPatients} patients max)
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={slot.isActive} 
                              onCheckedChange={(checked) => toggleSlotStatus(slot.id, checked)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteEmergencySlot(slot.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No emergency slots defined. Add a slot to start accepting emergency appointments.
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyAvailability;
