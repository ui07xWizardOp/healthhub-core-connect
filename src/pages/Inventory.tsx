
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  PackagePlus, 
  Search,
  AlertCircle,
  FilePlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from "@/integrations/supabase/client";
import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryFilters from '@/components/inventory/InventoryFilters';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    minStock: '',
  });
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          categories(categoryname)
        `)
        .order('productname', { ascending: true });
        
      if (productError) throw productError;
      
      // Get batch information for each product to calculate current stock levels
      const productsWithStock = await Promise.all(productData.map(async (product) => {
        const { data: batches, error: batchError } = await supabase
          .from('batchinventory')
          .select('quantityinstock, expirydate')
          .eq('productid', product.productid)
          .eq('isactive', true);
        
        if (batchError) throw batchError;
        
        const totalStock = batches?.reduce((sum, batch) => sum + (batch.quantityinstock || 0), 0) || 0;
        const expiringBatches = batches?.filter(batch => {
          const expiryDate = new Date(batch.expirydate);
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
          return expiryDate < threeMonthsFromNow;
        }) || [];
        
        return {
          ...product,
          currentStock: totalStock,
          hasExpiringItems: expiringBatches.length > 0,
          lowStock: totalStock < (product.reorderthreshold || 10)
        };
      }));
      
      return productsWithStock;
    }
  });
  
  // Get categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('categoryname');
        
      if (error) throw error;
      return data;
    }
  });
  
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
    refetch();
  };
  
  const filteredProducts = products?.filter(product => {
    // Text search
    const matchesSearch = 
      product.productname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.genericname?.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Category filter
    const matchesCategory = 
      filters.category === 'all' || 
      product.categoryid?.toString() === filters.category;
      
    // Status filter
    let matchesStatus = true;
    if (filters.status === 'low') {
      matchesStatus = product.lowStock;
    } else if (filters.status === 'expiring') {
      matchesStatus = product.hasExpiringItems;
    } else if (filters.status === 'inactive') {
      matchesStatus = !product.isactive;
    }
    
    // Minimum stock filter
    const matchesMinStock = 
      !filters.minStock || 
      product.currentStock >= parseInt(filters.minStock);
      
    return matchesSearch && matchesCategory && matchesStatus && matchesMinStock;
  });
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-healthhub-orange hover:bg-healthhub-orange/90"
          >
            <PackagePlus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader className="bg-healthhub-blue/20 py-4">
              <CardTitle className="flex items-center text-xl font-semibold">
                <Package className="mr-2 h-5 w-5" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <div className="w-full md:w-1/3 relative">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                
                <InventoryFilters 
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories || []}
                />
                
                <div className="flex items-center text-sm text-gray-600 mt-2 md:mt-0">
                  {filteredProducts ? `${filteredProducts.length} products found` : 'Loading...'}
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">Loading inventory...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading inventory: {error.message}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Generic Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Reorder Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts && filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.productid} className={!product.isactive ? 'bg-gray-50 opacity-70' : ''}>
                            <TableCell className="font-medium">
                              {product.productname}
                            </TableCell>
                            <TableCell>{product.genericname || 'N/A'}</TableCell>
                            <TableCell>{product.categories?.categoryname || 'Uncategorized'}</TableCell>
                            <TableCell className={`text-right ${product.lowStock ? 'text-red-500 font-semibold' : ''}`}>
                              {product.currentStock}
                            </TableCell>
                            <TableCell className="text-right">
                              {product.reorderthreshold || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {!product.isactive ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              ) : product.lowStock ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Low Stock
                                </span>
                              ) : product.hasExpiringItems ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Expiring Soon
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  In Stock
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-8 w-8 p-0 text-healthhub-orange hover:text-healthhub-orange hover:bg-healthhub-blue/20"
                                >
                                  <FilePlus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {showForm && (
          <InventoryForm 
            product={selectedProduct} 
            categories={categories || []}
            onClose={handleCloseForm} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
