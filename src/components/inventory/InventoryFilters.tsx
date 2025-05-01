
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

interface InventoryFiltersProps {
  filters: {
    category: string;
    status: string;
    minStock: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    category: string;
    status: string;
    minStock: string;
  }>>;
  categories: Array<{ categoryid: number; categoryname: string }>;
}

const InventoryFilters = ({ filters, setFilters, categories }: InventoryFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="flex flex-col md:flex-row items-end gap-3">
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
    </div>
  );
};

export default InventoryFilters;
