
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface InventoryFormProps {
  product?: any;
  categories: Array<{ categoryid: number; categoryname: string }>;
  onClose: () => void;
}

const InventoryForm = ({ product, categories, onClose }: InventoryFormProps) => {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    productname: product?.productname || '',
    genericname: product?.genericname || '',
    categoryid: product?.categoryid?.toString() || '',
    description: product?.description || '',
    dosageform: product?.dosageform || '',
    strength: product?.strength || '',
    unitofmeasure: product?.unitofmeasure || '',
    requiresprescription: product ? product.requiresprescription : false,
    reorderthreshold: product?.reorderthreshold || 10,
    defaulttax: product?.defaulttax || 0,
    isactive: product ? product.isactive : true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const dataToSubmit = {
        ...formData,
        categoryid: formData.categoryid ? parseInt(formData.categoryid) : null,
        reorderthreshold: formData.reorderthreshold ? parseInt(formData.reorderthreshold as string) : null,
        defaulttax: formData.defaulttax ? parseFloat(formData.defaulttax as string) : 0
      };
      
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('products')
          .update(dataToSubmit)
          .eq('productid', product.productid);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([dataToSubmit]);
          
        if (insertError) throw insertError;
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'An error occurred while saving the product');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-healthhub-blue/20">
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {isEditing ? `Edit Product: ${product.productname}` : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productname">Product Name*</Label>
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
                  <SelectTrigger id="categoryid" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.categoryid} 
                        value={category.categoryid.toString()}
                      >
                        {category.categoryname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosageform">Dosage Form</Label>
                <Select
                  value={formData.dosageform || ''}
                  onValueChange={(value) => handleSelectChange('dosageform', value)}
                >
                  <SelectTrigger id="dosageform" className="w-full">
                    <SelectValue placeholder="Select a form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Specified</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Ointment">Ointment</SelectItem>
                    <SelectItem value="Powder">Powder</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                    <SelectItem value="Device">Device</SelectItem>
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
                <Select
                  value={formData.unitofmeasure || ''}
                  onValueChange={(value) => handleSelectChange('unitofmeasure', value)}
                >
                  <SelectTrigger id="unitofmeasure" className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Specified</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Strip">Strip</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Vial">Vial</SelectItem>
                    <SelectItem value="Tube">Tube</SelectItem>
                    <SelectItem value="Unit">Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reorderthreshold">Reorder Threshold</Label>
                <Input
                  id="reorderthreshold"
                  name="reorderthreshold"
                  type="number"
                  min="0"
                  value={formData.reorderthreshold}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaulttax">Default Tax (%)</Label>
                <Input
                  id="defaulttax"
                  name="defaulttax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.defaulttax}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="h-24"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresprescription"
                  name="requiresprescription"
                  checked={formData.requiresprescription}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-healthhub-orange focus:ring-healthhub-orange"
                />
                <Label htmlFor="requiresprescription">Requires Prescription</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isactive"
                  name="isactive"
                  checked={formData.isactive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-healthhub-orange focus:ring-healthhub-orange"
                />
                <Label htmlFor="isactive">Active</Label>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4 bg-gray-50 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-healthhub-orange hover:bg-healthhub-orange/90"
            >
              <Check className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InventoryForm;
