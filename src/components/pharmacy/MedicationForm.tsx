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

interface MedicationFormProps {
  medication: any | null;
  onClose: () => void;
}

const MedicationForm = ({ medication, onClose }: MedicationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productname: '',
    genericname: '',
    description: '',
    categoryid: '',
    dosageform: '',
    strength: '',
    unitofmeasure: '',
    requiresprescription: false,
    reorderthreshold: '',
    defaulttax: '',
    hsncode: '',
    isactive: true
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['medication-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('categoryname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize form with medication data if editing
  useEffect(() => {
    if (medication) {
      setFormData({
        productname: medication.productname || '',
        genericname: medication.genericname || '',
        description: medication.description || '',
        categoryid: medication.categoryid ? medication.categoryid.toString() : '',
        dosageform: medication.dosageform || '',
        strength: medication.strength || '',
        unitofmeasure: medication.unitofmeasure || '',
        requiresprescription: medication.requiresprescription || false,
        reorderthreshold: medication.reorderthreshold ? medication.reorderthreshold.toString() : '',
        defaulttax: medication.defaulttax ? medication.defaulttax.toString() : '',
        hsncode: medication.hsncode || '',
        isactive: medication.isactive !== false
      });
    }
  }, [medication]);

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
      const medicationData = {
        productname: formData.productname,
        genericname: formData.genericname,
        description: formData.description,
        categoryid: formData.categoryid ? parseInt(formData.categoryid) : null,
        dosageform: formData.dosageform,
        strength: formData.strength,
        unitofmeasure: formData.unitofmeasure,
        requiresprescription: formData.requiresprescription,
        reorderthreshold: formData.reorderthreshold ? parseInt(formData.reorderthreshold) : null,
        defaulttax: formData.defaulttax ? parseFloat(formData.defaulttax) : 0,
        hsncode: formData.hsncode,
        isactive: formData.isactive
      };

      if (medication) {
        // Update existing medication
        const { error } = await supabase
          .from('products')
          .update(medicationData)
          .eq('productid', medication.productid);

        if (error) throw error;

        toast({
          title: "Medication Updated",
          description: "The medication has been updated successfully."
        });
      } else {
        // Create new medication
        const { error } = await supabase
          .from('products')
          .insert([medicationData]);

        if (error) throw error;

        toast({
          title: "Medication Created",
          description: "The new medication has been created successfully."
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the medication.",
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
          <DialogTitle>{medication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productname">Medication Name *</Label>
                <Input
                  id="productname"
                  name="productname"
                  value={formData.productname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genericname">Generic Name</Label>
                <Input
                  id="genericname"
                  name="genericname"
                  value={formData.genericname}
                  onChange={handleChange}
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
                <Label htmlFor="dosageform">Dosage Form</Label>
                <Select
                  value={formData.dosageform}
                  onValueChange={(value) => handleSelectChange('dosageform', value)}
                >
                  <SelectTrigger id="dosageform">
                    <SelectValue placeholder="Select dosage form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Ointment">Ointment</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                    <SelectItem value="Spray">Spray</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  placeholder="e.g., 500mg, 5ml"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitofmeasure">Unit of Measure</Label>
                <Input
                  id="unitofmeasure"
                  name="unitofmeasure"
                  value={formData.unitofmeasure}
                  onChange={handleChange}
                  placeholder="e.g., Tablet, Bottle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reorderthreshold">Reorder Threshold</Label>
                <Input
                  id="reorderthreshold"
                  name="reorderthreshold"
                  type="number"
                  value={formData.reorderthreshold}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaulttax">Default Tax (%)</Label>
                <Input
                  id="defaulttax"
                  name="defaulttax"
                  type="number"
                  step="0.01"
                  value={formData.defaulttax}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hsncode">HSN Code</Label>
                <Input
                  id="hsncode"
                  name="hsncode"
                  value={formData.hsncode}
                  onChange={handleChange}
                />
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
                <Label htmlFor="requiresprescription" className="block mb-2">Requires Prescription</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresprescription"
                    checked={formData.requiresprescription}
                    onCheckedChange={(checked) => handleSwitchChange('requiresprescription', checked)}
                  />
                  <Label htmlFor="requiresprescription" className="cursor-pointer">
                    {formData.requiresprescription ? 'Yes' : 'No'}
                  </Label>
                </div>
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
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#FE654F] hover:bg-[#FE654F]/90" disabled={loading}>
              {loading ? 'Saving...' : (medication ? 'Update Medication' : 'Create Medication')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationForm;
