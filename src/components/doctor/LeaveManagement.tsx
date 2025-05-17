
import React, { useState } from 'react';
import { format, parseISO, differenceInDays, isBefore } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const LeaveManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    startdate: format(new Date(), 'yyyy-MM-dd'),
    enddate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  });

  // Fetch doctor's leaves
  const { 
    data: leavesData, 
    isLoading,
    refetch: refetchLeaves
  } = useQuery({
    queryKey: ['doctor-leaves', userProfile?.doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctorleaves')
        .select('*')
        .eq('doctorid', userProfile?.doctorId)
        .order('startdate', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.doctorId
  });
  
  const handleLeaveChange = (field: string, value: string) => {
    setLeaveFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitLeave = async () => {
    // Validate dates
    const startDate = new Date(leaveFormData.startdate);
    const endDate = new Date(leaveFormData.enddate);
    
    if (isBefore(endDate, startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    
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
      setIsDialogOpen(false);
      refetchLeaves();
      
      // Reset form
      setLeaveFormData({
        startdate: format(new Date(), 'yyyy-MM-dd'),
        enddate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
      });
    } catch (error: any) {
      toast.error('Failed to submit leave request');
      console.error('Error requesting leave:', error);
    }
  };
  
  const cancelLeaveRequest = async (leaveId: number) => {
    try {
      const { error } = await supabase
        .from('doctorleaves')
        .update({ status: 'Cancelled' })
        .eq('leaveid', leaveId);
        
      if (error) throw error;
      
      toast.success('Leave request cancelled');
      refetchLeaves();
    } catch (error: any) {
      toast.error('Failed to cancel leave request');
      console.error('Error cancelling leave:', error);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Management</CardTitle>
        <CardDescription>
          Request time off and manage your leave schedule
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <Button onClick={() => setIsDialogOpen(true)}>Request Time Off</Button>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-20 bg-gray-100 w-full rounded"></div>
              <div className="h-20 bg-gray-100 w-full rounded"></div>
            </div>
          ) : leavesData && leavesData.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Upcoming & Recent Leaves</h3>
              
              {leavesData.map((leave) => {
                const startDate = parseISO(leave.startdate);
                const endDate = parseISO(leave.enddate);
                const duration = differenceInDays(endDate, startDate) + 1;
                
                return (
                  <Card key={leave.leaveid} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                            <span className="text-sm text-gray-600 ml-2">
                              ({duration} day{duration > 1 ? 's' : ''})
                            </span>
                          </div>
                          {leave.reason && (
                            <div className="text-sm text-gray-600">{leave.reason}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status}
                          </Badge>
                          
                          {leave.status === 'Pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => cancelLeaveRequest(leave.leaveid)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No upcoming leaves
            </div>
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Submit a request for time off from your schedule
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startdate" className="text-sm font-medium">Start Date</label>
                  <Input
                    id="startdate"
                    type="date"
                    value={leaveFormData.startdate}
                    onChange={(e) => handleLeaveChange('startdate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="enddate" className="text-sm font-medium">End Date</label>
                  <Input
                    id="enddate"
                    type="date"
                    value={leaveFormData.enddate}
                    onChange={(e) => handleLeaveChange('enddate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">Reason (Optional)</label>
                <Textarea
                  id="reason"
                  value={leaveFormData.reason}
                  onChange={(e) => handleLeaveChange('reason', e.target.value)}
                  placeholder="Provide a reason for your leave request"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitLeave}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LeaveManagement;
