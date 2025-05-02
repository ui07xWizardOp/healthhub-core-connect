
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InventoryFiltersProps {
  filters: {
    category: string;
    status: string;
    minStock: string;
    [key: string]: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    category: string;
    status: string;
    minStock: string;
    [key: string]: string;
  }>>;
  categories: Array<{ categoryid: number; categoryname: string }>;
  onReset?: () => void;
  additionalFilters?: React.ReactNode;
}

const InventoryFilters = ({ 
  filters, 
  setFilters, 
  categories, 
  onReset,
  additionalFilters 
}: InventoryFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleReset = () => {
    setFilters({
      category: 'all',
      status: 'all',
      minStock: ''
    });
    
    if (onReset) {
      onReset();
    }
  };
  
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row items-end gap-3 flex-wrap">
        <div className="w-full md:w-auto">
          <Label htmlFor="category-filter" className="text-sm text-gray-500 mb-1 block">
            Category
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger id="category-filter" className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.categoryid} value={category.categoryid.toString()}>
                  {category.categoryname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Label htmlFor="status-filter" className="text-sm text-gray-500 mb-1 block">
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger id="status-filter" className="w-full md:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Label htmlFor="min-stock" className="text-sm text-gray-500 mb-1 block">
            Min Stock
          </Label>
          <Input
            id="min-stock"
            type="number"
            value={filters.minStock}
            onChange={(e) => handleFilterChange('minStock', e.target.value)}
            className="w-full md:w-[100px]"
            placeholder="Min"
            min="0"
          />
        </div>
        
        {additionalFilters}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 px-2 text-gray-500 hover:text-gray-700"
          onClick={handleReset}
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default InventoryFilters;
