
import React, { useState, useEffect } from 'react';
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
  UserPlus, 
  UserCheck, 
  UserX, 
  Users 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from "@/integrations/supabase/client";
import EmployeeForm from '@/components/employees/EmployeeForm';

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('lastname', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });
  
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    refetch();
  };
  
  const filteredEmployees = employees?.filter(employee => 
    employee.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    employee.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-healthhub-orange hover:bg-healthhub-orange/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="bg-healthhub-blue/20 py-4">
            <CardTitle className="flex items-center text-xl font-semibold">
              <Users className="mr-2 h-5 w-5" />
              Employee Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between mb-4">
              <div className="w-1/3">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center text-sm text-gray-600">
                {filteredEmployees ? `${filteredEmployees.length} employees found` : 'Loading...'}
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading employees: {error.message}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees && filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.userid}>
                          <TableCell className="font-medium">
                            {employee.firstname} {employee.lastname}
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.isactive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="h-8 w-8 p-0 text-healthhub-orange hover:text-healthhub-orange hover:bg-healthhub-blue/20"
                            >
                              {employee.isactive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          No employees found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {showForm && (
          <EmployeeForm 
            employee={selectedEmployee} 
            onClose={handleCloseForm} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
