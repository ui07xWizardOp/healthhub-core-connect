
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText,
  Download,
  PillIcon,
  ClipboardList,
  UserCircle,
  ChevronRight,
  Mail
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [data, setData] = useState({
    appointments: [],
    prescriptions: [],
    labReports: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCustomerData() {
      if (!userProfile?.customerId) return;
      
      setLoading(true);
      try {
        // Fetch upcoming appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            appointmentid,
            appointmentdate,
            appointmenttime,
            doctorid (firstname, lastname, specialization),
            status
          `)
          .eq('customerid', userProfile.customerId)
          .gte('appointmentdate', new Date().toISOString().split('T')[0])
          .order('appointmentdate', { ascending: true })
          .order('appointmenttime', { ascending: true })
          .limit(5);
        
        if (appointmentsError) throw appointmentsError;

        // Fetch prescriptions
        const { data: prescriptions, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select(`
            prescriptionid,
            prescriptiondate,
            expirydate,
            prescribingdoctor,
            doctorid (firstname, lastname, specialization)
          `)
          .eq('customerid', userProfile.customerId)
          .order('prescriptiondate', { ascending: false })
          .limit(5);
        
        if (prescriptionsError) throw prescriptionsError;

        // Fetch lab reports
        const { data: labOrders, error: labOrdersError } = await supabase
          .from('laborders')
          .select(`
            orderid,
            orderdate,
            status,
            referredby
          `)
          .eq('customerid', userProfile.customerId)
          .order('orderdate', { ascending: false })
          .limit(5);
        
        if (labOrdersError) throw labOrdersError;

        setData({
          appointments: appointments || [],
          prescriptions: prescriptions || [],
          labReports: labOrders || []
        });
      } catch (error: any) {
        console.error('Error fetching customer dashboard data:', error.message);
        toast({
          title: "Error fetching your data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [userProfile, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userProfile?.firstname}</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your health information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-healthhub-orange" />
              Upcoming Appointments
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-healthhub-orange">
              Book New <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading appointments...</p>
            ) : data.appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Button className="mt-4" variant="default">Book an Appointment</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.appointments.map((appointment: any) => (
                  <div key={appointment.appointmentid} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {appointment.doctorid ? `Dr. ${appointment.doctorid.firstname} ${appointment.doctorid.lastname}` : 'Doctor'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appointment.doctorid?.specialization || 'General Physician'}
                        </p>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      <span>
                        {new Date(appointment.appointmentdate).toLocaleDateString()} at {
                          appointment.appointmenttime ? 
                          new Date(`2000-01-01T${appointment.appointmenttime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                          'Not set'
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <PillIcon className="mr-2 h-5 w-5 text-healthhub-orange" />
              Active Prescriptions
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-healthhub-orange">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading prescriptions...</p>
            ) : data.prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No active prescriptions</p>
                <Button className="mt-4" variant="outline">Request Refill</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.prescriptions.map((prescription: any) => (
                  <div key={prescription.prescriptionid} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <p className="font-medium">Prescription #{prescription.prescriptionid}</p>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Prescribed by: {prescription.doctorid ? 
                        `Dr. ${prescription.doctorid.firstname} ${prescription.doctorid.lastname}` : 
                        prescription.prescribingdoctor || 'Unknown'
                      }
                    </p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-gray-500">
                        Prescribed: {new Date(prescription.prescriptiondate).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span className={`${
                        new Date(prescription.expirydate) < new Date() ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        Expires: {new Date(prescription.expirydate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-healthhub-orange" />
              Lab Reports
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-healthhub-orange">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading lab reports...</p>
            ) : data.labReports.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No lab reports available</p>
                <Button className="mt-4" variant="outline">Book a Test</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.labReports.map((report: any) => (
                  <div key={report.orderid} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <p className="font-medium">Report #{report.orderid}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        disabled={report.status !== 'Completed' && report.status !== 'Delivered'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Referred by: {report.referredby || 'Self'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Date: {new Date(report.orderdate).toLocaleDateString()}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'Completed' || report.status === 'Delivered' ? 
                          'bg-green-100 text-green-800' : 
                        report.status === 'InProcess' ? 
                          'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-center pb-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircle className="h-20 w-20 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{userProfile?.firstname} {userProfile?.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userProfile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userProfile?.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{userProfile?.gender || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{userProfile?.bloodGroup || 'Not set'}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">Update Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                <Calendar className="h-6 w-6" />
                <span>Book Appointment</span>
              </Button>
              
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
                <PillIcon className="h-6 w-6" />
                <span>Request Refill</span>
              </Button>
              
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">
                <ClipboardList className="h-6 w-6" />
                <span>Book Lab Test</span>
              </Button>
              
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200">
                <Mail className="h-6 w-6" />
                <span>Contact Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
