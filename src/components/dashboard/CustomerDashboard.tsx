
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Calendar, 
  FileText,
  Download,
  PillIcon,
  ClipboardList,
  UserCircle,
  ChevronRight,
  Mail,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface MedicationData {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  remaining: number;
  refilltrigger: number;
}

const CustomerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    appointments: [],
    prescriptions: [],
    labReports: [],
    medications: [] as MedicationData[],
    healthMetrics: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock health metrics data for the chart
  const healthMetricsData = [
    { date: '2025-04-01', bloodPressure: '120/80', glucose: 95, weight: 70 },
    { date: '2025-04-15', bloodPressure: '118/78', glucose: 92, weight: 69.5 },
    { date: '2025-05-01', bloodPressure: '122/82', glucose: 94, weight: 69 },
    { date: '2025-05-15', bloodPressure: '119/79', glucose: 90, weight: 68.5 },
    { date: '2025-06-01', bloodPressure: '120/80', glucose: 92, weight: 68 }
  ];

  // Format data for the chart
  const chartData = healthMetricsData.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    glucose: item.glucose,
    weight: item.weight
  }));

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

        // Fetch prescription items (medications) using custom function
        const { data: medications, error: medicationsError } = await supabase
          .rpc('get_patient_medications', {
            p_customer_id: userProfile.customerId
          });
          
        if (medicationsError) throw medicationsError;

        // Fetch notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('userid', userProfile.userid)
          .order('createddatetime', { ascending: false })
          .limit(5);
          
        if (notificationsError) throw notificationsError;

        setData({
          appointments: appointments || [],
          prescriptions: prescriptions || [],
          labReports: labOrders || [],
          medications: medications as MedicationData[] || [],
          healthMetrics: healthMetricsData, // Using mock data for now
          notifications: notifications || []
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

  // Determine if a medication needs refill (example logic)
  const needsRefill = (medication: MedicationData) => {
    return medication.remaining && medication.remaining <= medication.refilltrigger;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userProfile?.firstname}</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your health information</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
                    {data.appointments.slice(0, 3).map((appointment: any) => (
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
                  Medications
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1 text-healthhub-orange">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-4 text-gray-500">Loading medications...</p>
                ) : data.medications.length === 0 ? (
                  <div className="text-center py-8">
                    <PillIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No active medications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.medications.slice(0, 3).map((med: MedicationData, index: number) => (
                      <div key={index} className="p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex justify-between">
                          <p className="font-medium">{med.medication}</p>
                          {needsRefill(med) && (
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Refill
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{med.dosage || 'As directed'}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-gray-500">
                            Frequency: {med.frequency || 'As needed'}
                          </span>
                          {med.remaining && (
                            <span className={`${
                              needsRefill(med) ? 'text-red-500 font-medium' : 'text-gray-500'
                            }`}>
                              {med.remaining} remaining
                            </span>
                          )}
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
                    {data.labReports.slice(0, 3).map((report: any) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-healthhub-orange" />
                  Health Metrics
                </CardTitle>
                <CardDescription>
                  Your recent health measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ChartContainer
                    config={{
                      glucose: {
                        label: 'Glucose',
                        theme: {
                          light: 'hsl(var(--chart-1))',
                          dark: 'hsl(var(--chart-1))',
                        },
                      },
                      weight: {
                        label: 'Weight',
                        theme: {
                          light: 'hsl(var(--chart-2))',
                          dark: 'hsl(var(--chart-2))',
                        },
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--chart-1)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--chart-2)" />
                        <ChartTooltip
                          cursor={{ stroke: "#f3f4f6", strokeWidth: 2 }}
                          content={<ChartTooltipContent />}
                        />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="glucose" 
                          name="Glucose"
                          stroke="var(--chart-1)" 
                          fillOpacity={1}
                          fill="url(#colorGlucose)" 
                        />
                        <Area 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight"
                          stroke="var(--chart-2)" 
                          fillOpacity={1}
                          fill="url(#colorWeight)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Glucose</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">92 mg/dL</p>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Weight</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">68 kg</p>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">120/80</p>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-healthhub-orange" />
                  Notifications
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1 text-healthhub-orange">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-4 text-gray-500">Loading notifications...</p>
                ) : data.notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.notifications.map((notification: any) => (
                      <div key={notification.notificationid} className="p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          {notification.notificationtype === 'Refill' && (
                            <PillIcon className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          {notification.notificationtype === 'Appointment' && (
                            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          {notification.notificationtype === 'LabResult' && (
                            <ClipboardList className="h-5 w-5 text-green-500 mt-0.5" />
                          )}
                          {(!notification.notificationtype || notification.notificationtype === 'System') && (
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createddatetime).toLocaleString()}
                            </p>
                          </div>
                          {!notification.isread && (
                            <span className="inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Example medication refill notifications */}
                    {data.medications && data.medications.some((med: MedicationData) => needsRefill(med)) && (
                      <div className="p-3 border rounded-md hover:bg-gray-50 bg-red-50">
                        <div className="flex items-start gap-3">
                          <PillIcon className="h-5 w-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">Medication Refill Needed</p>
                            <p className="text-sm text-gray-600">
                              {data.medications.filter((med: MedicationData) => needsRefill(med)).map((med: MedicationData) => med.medication).join(', ')} need refilling.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Today</p>
                          </div>
                          <span className="inline-block h-2 w-2 bg-red-500 rounded-full"></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>View and manage your upcoming and past medical appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div>
                  <Button variant="default">Book New Appointment</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Upcoming</Button>
                  <Button variant="outline" size="sm">Past</Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading appointments...</TableCell>
                      </TableRow>
                    ) : data.appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No appointments found</TableCell>
                      </TableRow>
                    ) : (
                      data.appointments.map((appointment: any) => (
                        <TableRow key={appointment.appointmentid}>
                          <TableCell>
                            <div className="font-medium">
                              {new Date(appointment.appointmentdate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.appointmenttime ? 
                                new Date(`2000-01-01T${appointment.appointmenttime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                'Not set'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.doctorid ? `Dr. ${appointment.doctorid.firstname} ${appointment.doctorid.lastname}` : 'Not assigned'}
                          </TableCell>
                          <TableCell>{appointment.doctorid?.specialization || 'General'}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                              appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">View</Button>
                              {appointment.status === 'Scheduled' && (
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Cancel</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-healthhub-orange" />
                  Health Metrics Trends
                </CardTitle>
                <CardDescription>
                  Track your health metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorGlucoseExt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWeightExt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="glucose" stroke="#8884d8" fillOpacity={1} fill="url(#colorGlucoseExt)" />
                      <Area type="monotone" dataKey="weight" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWeightExt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Recent Readings</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Blood Pressure</TableHead>
                        <TableHead>Glucose (mg/dL)</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthMetricsData.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{entry.bloodPressure}</TableCell>
                          <TableCell>{entry.glucose}</TableCell>
                          <TableCell>{entry.weight}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">Add New Reading</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-healthhub-orange" />
                    Recent Lab Results
                  </CardTitle>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.labReports.map((report: any) => (
                          <TableRow key={report.orderid}>
                            <TableCell>{format(new Date(report.orderdate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>Lab Order #{report.orderid}</TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                report.status === 'Completed' || report.status === 'Delivered' ? 
                                  'bg-green-100 text-green-800' : 
                                report.status === 'InProcess' ? 
                                  'bg-blue-100 text-blue-800' : 
                                  'bg-amber-100 text-amber-800'
                              }`}>
                                {report.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={report.status !== 'Completed' && report.status !== 'Delivered'}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PillIcon className="mr-2 h-5 w-5 text-healthhub-orange" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-4 text-gray-500">Loading medications...</p>
                  ) : data.medications.length === 0 ? (
                    <div className="text-center py-8">
                      <PillIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No active medications</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Remaining</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.medications.map((med: MedicationData, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{med.medication}</TableCell>
                            <TableCell>{med.dosage || 'As directed'}</TableCell>
                            <TableCell>{med.frequency || 'As needed'}</TableCell>
                            <TableCell>{med.remaining || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              {needsRefill(med) ? (
                                <Button size="sm" className="bg-red-500 hover:bg-red-600">Refill</Button>
                              ) : (
                                <span className="text-green-500">Active</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
