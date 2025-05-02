import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface LabTestFormProps {
  test: any | null;
  onClose: () => void;
}

const LabTestForm = ({ test, onClose }: LabTestFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    testname: '',
    description: '',
    sampletype: '',
    testingmethod: '',
    price: '',
    turnaroundtime: '',
    units: '',
    malenormalrange: '',
    femalenormalrange: '',
    childnormalrange: '',
    instructions: '',
    categoryid: '',
    isactive: true
  });

  // Fetch test categories
  const { data: categories } = useQuery({
    queryKey: ['test-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testcategories')
        .select('*')
        .order('categoryname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize form with test data if editing
  useEffect(() => {
    if (test) {
      setFormData({
        testname: test.testname || '',
        description: test.description || '',
        sampletype: test.sampletype || '',
        testingmethod: test.testingmethod || '',
        price: test.price ? test.price.toString() : '',
        turnaroundtime: test.turnaroundtime ? test.turnaroundtime.toString() : '',
        units: test.units || '',
        malenormalrange: test.malenormalrange || '',
        femalenormalrange: test.femalenormalrange || '',
        childnormalrange: test.childnormalrange || '',
        instructions: test.instructions || '',
        categoryid: test.categoryid ? test.categoryid.toString() : '',
        isactive: test.isactive !== false
      });
    }
  }, [test]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string values to appropriate types
      const testData = {
        testname: formData.testname,
        description: formData.description,
        sampletype: formData.sampletype,
        testingmethod: formData.testingmethod,
        price: formData.price ? parseFloat(formData.price) : null,
        turnaroundtime: formData.turnaroundtime ? parseInt(formData.turnaroundtime) : null,
        units: formData.units,
        malenormalrange: formData.malenormalrange,
        femalenormalrange: formData.femalenormalrange,
        childnormalrange: formData.childnormalrange,
        instructions: formData.instructions,
        categoryid: formData.categoryid ? parseInt(formData.categoryid) : null,
        isactive: formData.isactive
      };

      if (test) {
        // Update existing test
        const { error } = await supabase
          .from('labtests')
          .update(testData)
          .eq('testid', test.testid);

        if (error) throw error;

        toast({
          title: "Test Updated",
          description: "The test has been updated successfully."
        });
      } else {
        // Create new test
        const { error } = await supabase
          .from('labtests')
          .insert([testData]);

        if (error) throw error;

        toast({
          title: "Test Created",
          description: "The new test has been created successfully."
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving test:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the test.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? 'Edit Test' : 'Add New Test'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testname">Test Name *</Label>
                <Input
                  id="testname"
                  name="testname"
                  value={formData.testname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryid">Category</Label>
                <Select
                  value={formData.categoryid}
                  onValueChange={(value) => handleSelectChange('categoryid', value)}
                >
                  <SelectTrigger id="categoryid">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.categoryid} value={category.categoryid.toString()}>
                        {category.categoryname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampletype">Sample Type</Label>
                <Input
                  id="sampletype"
                  name="sampletype"
                  value={formData.sampletype}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testingmethod">Testing Method</Label>
                <Input
                  id="testingmethod"
                  name="testingmethod"
                  value={formData.testingmethod}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turnaroundtime">Turnaround Time (hours)</Label>
                <Input
                  id="turnaroundtime"
                  name="turnaroundtime"
                  type="number"
                  value={formData.turnaroundtime}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isactive" className="block mb-2">Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isactive"
                    checked={formData.isactive}
                    onCheckedChange={(checked) => handleSwitchChange('isactive', checked)}
                  />
                  <Label htmlFor="isactive" className="cursor-pointer">
                    {formData.isactive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="malenormalrange">Male Normal Range</Label>
                <Input
                  id="malenormalrange"
                  name="malenormalrange"
                  value={formData.malenormalrange}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="femalenormalrange">Female Normal Range</Label>
                <Input
                  id="femalenormalrange"
                  name="femalenormalrange"
                  value={formData.femalenormalrange}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="childnormalrange">Child Normal Range</Label>
                <Input
                  id="childnormalrange"
                  name="childnormalrange"
                  value={formData.childnormalrange}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#FE654F] hover:bg-[#FE654F]/90" disabled={loading}>
              {loading ? 'Saving...' : (test ? 'Update Test' : 'Create Test')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LabTestForm;
