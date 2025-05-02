
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";

interface TestResultFormProps {
  order: any | null;
  onClose: () => void;
}

const TestResultForm = ({ order, onClose }: TestResultFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [resultData, setResultData] = useState({
    result: '',
    resultnotes: '',
    isabnormal: false
  });

  // Fetch order items for this order
  const { data: orderItems, isLoading: loadingItems, refetch: refetchItems } = useQuery({
    queryKey: ['order-items', order?.orderid],
    enabled: !!order?.orderid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laborderitems')
        .select(`
          *,
          labtests(*),
          testpanels(*)
        `)
        .eq('orderid', order.orderid);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch any existing results for the selected order item
  const { data: existingResults, refetch: refetchResults } = useQuery({
    queryKey: ['test-results', selectedOrderItem?.orderitemid],
    enabled: !!selectedOrderItem?.orderitemid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testresults')
        .select('*')
        .eq('orderitemid', selectedOrderItem.orderitemid);
      
      if (error) throw error;
      return data?.[0] || null;
    }
  });

  // Update form when existing result is fetched
  useEffect(() => {
    if (existingResults) {
      setResultData({
        result: existingResults.result || '',
        resultnotes: existingResults.resultnotes || '',
        isabnormal: existingResults.isabnormal || false
      });
    } else {
      setResultData({
        result: '',
        resultnotes: '',
        isabnormal: false
      });
    }
  }, [existingResults]);

  const handleSelectOrderItem = (orderItem: any) => {
    setSelectedOrderItem(orderItem);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResultData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setResultData(prev => ({ ...prev, isabnormal: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrderItem) {
      toast({
        title: "Error",
        description: "Please select a test first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for saving
      const resultRecord = {
        orderitemid: selectedOrderItem.orderitemid,
        testid: selectedOrderItem.testid,
        result: resultData.result,
        resultnotes: resultData.resultnotes,
        isabnormal: resultData.isabnormal,
        testedby: 1, // TODO: Replace with actual user ID
        testeddatetime: new Date().toISOString()
      };

      if (existingResults) {
        // Update existing result
        const { error } = await supabase
          .from('testresults')
          .update({
            ...resultRecord,
            lastmodified: new Date().toISOString()
          })
          .eq('resultid', existingResults.resultid);

        if (error) throw error;
      } else {
        // Create new result
        const { error } = await supabase
          .from('testresults')
          .insert([resultRecord]);

        if (error) throw error;
      }

      // Update order item status
      const { error: updateError } = await supabase
        .from('laborderitems')
        .update({ status: 'Completed' })
        .eq('orderitemid', selectedOrderItem.orderitemid);

      if (updateError) throw updateError;

      // Check if all order items are completed
      const { data: remainingItems, error: checkError } = await supabase
        .from('laborderitems')
        .select('orderitemid')
        .eq('orderid', order.orderid)
        .neq('status', 'Completed');

      if (checkError) throw checkError;

      // If all items are completed, update the order status
      if (remainingItems?.length === 0) {
        const { error: orderError } = await supabase
          .from('laborders')
          .update({ status: 'Completed' })
          .eq('orderid', order.orderid);

        if (orderError) throw orderError;
      }

      toast({
        title: "Result Saved",
        description: "Test result has been saved successfully."
      });

      // Refresh data
      refetchItems();
      refetchResults();
    } catch (error: any) {
      console.error('Error saving test result:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the test result.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: any) => {
    if (item.testid && item.labtests) {
      return item.labtests.testname;
    } else if (item.panelid && item.testpanels) {
      return `${item.testpanels.panelname} (Panel)`;
    }
    return 'Unknown Test';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Process Test Results - Order #{order?.orderid}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label className="block mb-2">Patient</Label>
              <div className="p-2 border rounded bg-gray-50">
                {order?.users ? `${order.users.firstname} ${order.users.lastname}` : 'Unknown Patient'}
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Select Test</Label>
              {loadingItems ? (
                <div>Loading tests...</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                  {orderItems?.map((item) => (
                    <div
                      key={item.orderitemid}
                      className={`p-3 border rounded cursor-pointer flex justify-between items-center ${
                        selectedOrderItem?.orderitemid === item.orderitemid
                          ? 'border-[#FE654F] bg-[#FE654F]/5'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectOrderItem(item)}
                    >
                      <div className="font-medium">{getItemName(item)}</div>
                      <Badge className={
                        item.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'Processing' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {item.status || 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {selectedOrderItem && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 border rounded">
                  <div className="font-medium text-lg">
                    {getItemName(selectedOrderItem)}
                  </div>
                  {selectedOrderItem.testid && selectedOrderItem.labtests && (
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedOrderItem.labtests.sampletype && (
                        <div>Sample Type: {selectedOrderItem.labtests.sampletype}</div>
                      )}
                      {selectedOrderItem.labtests.units && (
                        <div>Units: {selectedOrderItem.labtests.units}</div>
                      )}
                      {selectedOrderItem.labtests.malenormalrange && (
                        <div>Male Normal Range: {selectedOrderItem.labtests.malenormalrange}</div>
                      )}
                      {selectedOrderItem.labtests.femalenormalrange && (
                        <div>Female Normal Range: {selectedOrderItem.labtests.femalenormalrange}</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="result">Result *</Label>
                  <Input
                    id="result"
                    name="result"
                    value={resultData.result}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resultnotes">Notes</Label>
                  <Textarea
                    id="resultnotes"
                    name="resultnotes"
                    value={resultData.resultnotes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isabnormal"
                    checked={resultData.isabnormal}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isabnormal" className="cursor-pointer">
                    Mark as abnormal result
                  </Label>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#FE654F] hover:bg-[#FE654F]/90" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Result'}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestResultForm;
