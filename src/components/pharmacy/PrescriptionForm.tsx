
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, X } from 'lucide-react';

interface PrescriptionFormProps {
  prescription: any | null;
  onClose: () => void;
}

interface PrescriptionItem {
  productid: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
  id?: number; // For existing items
  productName?: string; // For displaying product name
  genericName?: string; // Added for completeness
}

const PrescriptionForm = ({ prescription, onClose }: PrescriptionFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    customerid: '',
    doctorid: '',
    prescribingdoctor: '',
    notes: '',
    prescriptiondate: new Date().toISOString().split('T')[0],
    expirydate: ''
  });
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [newItem, setNewItem] = useState<PrescriptionItem>({
    productid: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: ''
  });

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('userid, firstname, lastname')
        .order('lastname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('doctorid, firstname, lastname')
        .eq('isactive', true)
        .order('lastname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch medications (products)
  const { data: medications } = useQuery({
    queryKey: ['medications-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          productid,
          productname,
          genericname,
          dosageform,
          strength
        `)
        .eq('isactive', true)
        .order('productname', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize form with prescription data if editing
  useEffect(() => {
    if (prescription) {
      setFormData({
        customerid: prescription.customerid ? prescription.customerid.toString() : '',
        doctorid: prescription.doctorid ? prescription.doctorid.toString() : '',
        prescribingdoctor: prescription.prescribingdoctor || '',
        notes: prescription.notes || '',
        prescriptiondate: prescription.prescriptiondate ? new Date(prescription.prescriptiondate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expirydate: prescription.expirydate ? new Date(prescription.expirydate).toISOString().split('T')[0] : ''
      });
      
      // Set view mode if just viewing prescription
      setIsViewMode(true);
      
      // Fetch prescription items
      fetchPrescriptionItems(prescription.prescriptionid);
    }
  }, [prescription]);

  const fetchPrescriptionItems = async (prescriptionId: number) => {
    try {
      const { data, error } = await supabase
        .from('prescriptionitems')
        .select(`
          prescriptionitemid,
          productid,
          dosage,
          frequency,
          duration,
          quantity,
          instructions,
          products(productname, genericname)
        `)
        .eq('prescriptionid', prescriptionId);
      
      if (error) throw error;
      
      setItems(data?.map(item => ({
        id: item.prescriptionitemid,
        productid: item.productid?.toString() || '',
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        duration: item.duration || '',
        quantity: item.quantity?.toString() || '',
        instructions: item.instructions || '',
        productName: item.products?.productname,
        genericName: item.products?.genericname
      })) || []);
    } catch (error) {
      console.error('Error fetching prescription items:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (field: keyof PrescriptionItem, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (!newItem.productid) {
      toast({
        title: "Error",
        description: "Please select a medication.",
        variant: "destructive"
      });
      return;
    }
    
    setItems(prevItems => [...prevItems, { ...newItem }]);
    setNewItem({
      productid: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: '',
      instructions: ''
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const getMedicationDisplay = (productId: string) => {
    const medication = medications?.find(med => med.productid.toString() === productId);
    if (!medication) return 'Unknown Medication';
    
    let display = medication.productname;
    
    if (medication.genericname) {
      display += ` (${medication.genericname})`;
    }
    
    if (medication.dosageform && medication.strength) {
      display += ` - ${medication.strength} ${medication.dosageform}`;
    } else if (medication.strength) {
      display += ` - ${medication.strength}`;
    } else if (medication.dosageform) {
      display += ` - ${medication.dosageform}`;
    }
    
    return display;
  };

  const handleToggleEditMode = () => {
    setIsViewMode(!isViewMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one medication to the prescription.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      // Convert string values to appropriate types
      const prescriptionData = {
        customerid: formData.customerid ? parseInt(formData.customerid) : null,
        doctorid: formData.doctorid ? parseInt(formData.doctorid) : null,
        prescribingdoctor: formData.prescribingdoctor,
        notes: formData.notes,
        prescriptiondate: formData.prescriptiondate,
        expirydate: formData.expirydate || null,
      };

      let prescriptionId;
      
      if (prescription) {
        // Update existing prescription
        const { error } = await supabase
          .from('prescriptions')
          .update(prescriptionData)
          .eq('prescriptionid', prescription.prescriptionid);

        if (error) throw error;
        
        prescriptionId = prescription.prescriptionid;
        
        // Delete existing items to replace them with new ones
        const { error: deleteError } = await supabase
          .from('prescriptionitems')
          .delete()
          .eq('prescriptionid', prescriptionId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new prescription
        const { data, error } = await supabase
          .from('prescriptions')
          .insert([prescriptionData])
          .select();

        if (error) throw error;
        
        prescriptionId = data?.[0].prescriptionid;
      }

      // Add prescription items
      const prescriptionItems = items.map(item => ({
        prescriptionid: prescriptionId,
        productid: parseInt(item.productid),
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity ? parseInt(item.quantity) : null,
        instructions: item.instructions
      }));
      
      const { error: itemsError } = await supabase
        .from('prescriptionitems')
        .insert(prescriptionItems);
      
      if (itemsError) throw itemsError;

      toast({
        title: prescription ? "Prescription Updated" : "Prescription Created",
        description: prescription 
          ? "The prescription has been updated successfully."
          : "The new prescription has been created successfully."
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the prescription.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode 
              ? `Prescription #${prescription?.prescriptionid}`
              : prescription 
                ? 'Edit Prescription' 
                : 'New Prescription'
            }
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerid">Patient</Label>
                <Select
                  value={formData.customerid}
                  onValueChange={(value) => handleSelectChange('customerid', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger id="customerid">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.userid} value={customer.userid.toString()}>
                        {customer.firstname} {customer.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doctorid">Doctor</Label>
                <Select
                  value={formData.doctorid}
                  onValueChange={(value) => handleSelectChange('doctorid', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger id="doctorid">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.doctorid} value={doctor.doctorid.toString()}>
                        Dr. {doctor.firstname} {doctor.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prescribingdoctor">Prescribing Doctor (External)</Label>
                <Input
                  id="prescribingdoctor"
                  name="prescribingdoctor"
                  value={formData.prescribingdoctor}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder="If doctor is not in the system"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prescriptiondate">Prescription Date</Label>
                <Input
                  id="prescriptiondate"
                  name="prescriptiondate"
                  type="date"
                  value={formData.prescriptiondate}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expirydate">Expiry Date</Label>
                <Input
                  id="expirydate"
                  name="expirydate"
                  type="date"
                  value={formData.expirydate}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  disabled={isViewMode}
                />
              </div>
            </div>
            
            <div className="mt-2">
              <h4 className="font-medium text-lg mb-2">Medications</h4>
              
              {/* Display current items */}
              {items.length > 0 ? (
                <div className="overflow-x-auto mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Qty</TableHead>
                        {!isViewMode && <TableHead></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.productName || getMedicationDisplay(item.productid)}
                          </TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          {!isViewMode && (
                            <TableCell>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No medications added yet
                </div>
              )}
              
              {/* Add new item form */}
              {!isViewMode && (
                <div className="border p-4 rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor="medication" className="mb-1 block">Medication</Label>
                      <Select
                        value={newItem.productid}
                        onValueChange={(value) => handleNewItemChange('productid', value)}
                      >
                        <SelectTrigger id="medication">
                          <SelectValue placeholder="Select medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications?.map((med) => (
                            <SelectItem key={med.productid} value={med.productid.toString()}>
                              {med.productname} {med.genericname ? `(${med.genericname})` : ''} {med.strength ? `- ${med.strength}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dosage" className="mb-1 block">Dosage</Label>
                      <Input
                        id="dosage"
                        value={newItem.dosage}
                        onChange={(e) => handleNewItemChange('dosage', e.target.value)}
                        placeholder="e.g., 1 tab"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="frequency" className="mb-1 block">Frequency</Label>
                      <Input
                        id="frequency"
                        value={newItem.frequency}
                        onChange={(e) => handleNewItemChange('frequency', e.target.value)}
                        placeholder="e.g., TID"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration" className="mb-1 block">Duration</Label>
                      <Input
                        id="duration"
                        value={newItem.duration}
                        onChange={(e) => handleNewItemChange('duration', e.target.value)}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                    
                    <div className="md:col-span-2 md:flex md:items-end">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <Label htmlFor="quantity" className="mb-1 block">Qty</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={newItem.quantity}
                            onChange={(e) => handleNewItemChange('quantity', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex items-end">
                          <Button 
                            type="button" 
                            className="w-full md:w-auto bg-[#FE654F] hover:bg-[#FE654F]/90"
                            onClick={handleAddItem}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-6">
                      <Label htmlFor="instructions" className="mb-1 block">Instructions</Label>
                      <Input
                        id="instructions"
                        value={newItem.instructions}
                        onChange={(e) => handleNewItemChange('instructions', e.target.value)}
                        placeholder="Special instructions"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            {prescription && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleToggleEditMode}
                className="mr-auto"
              >
                {isViewMode ? 'Edit' : 'Cancel Edit'}
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Close
            </Button>
            
            {!isViewMode && (
              <Button type="submit" className="bg-[#FE654F] hover:bg-[#FE654F]/90" disabled={loading}>
                {loading ? 'Saving...' : (prescription ? 'Update Prescription' : 'Create Prescription')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionForm;
