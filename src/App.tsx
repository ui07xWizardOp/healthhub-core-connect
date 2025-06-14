
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { LabTestCartProvider } from "@/contexts/LabTestCartContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProfileCompletion from "./pages/ProfileCompletion";
import Dashboard from "./pages/Dashboard";
import Pharmacy from "./pages/Pharmacy";
import Laboratory from "./pages/Laboratory";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import DoctorPortal from "./pages/DoctorPortal";
import NewPrescriptionPage from "./pages/NewPrescription";
import PatientManagement from "./pages/PatientManagement";
import Services from "./pages/Services";
import LabTests from "./pages/LabTests";
import LabTestBooking from "./pages/LabTestBooking";
import HealthPackages from "./pages/HealthPackages";
import AppointmentBookingPage from "./pages/AppointmentBookingPage";
import TestResultsPage from "./pages/TestResultsPage";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PermissionsProvider>
        <LabTestCartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Profile Completion Route */}
                <Route path="/complete-profile" element={
                  <ProtectedRoute>
                    <ProfileCompletion />
                  </ProtectedRoute>
                } />
                
                {/* Protected Routes with Profile Completion Check */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Dashboard />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy" element={
                  <ProtectedRoute requiredPermissions={['isStaff']}>
                    <ProfileCompletionGuard>
                      <Pharmacy />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/laboratory" element={
                  <ProtectedRoute requiredPermissions={['isStaff']}>
                    <ProfileCompletionGuard>
                      <Laboratory />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute requiredPermissions={['isStaff', 'isDoctor']}>
                    <ProfileCompletionGuard>
                      <Customers />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute requiredPermissions={['isStaff']}>
                    <ProfileCompletionGuard>
                      <Inventory />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute requiredRoles={['Admin']}>
                    <ProfileCompletionGuard>
                      <Employees />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <ProfileCompletionGuard>
                      <Settings />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                
                {/* Doctor Portal */}
                <Route path="/doctor-portal" element={
                  <ProtectedRoute requiredPermissions={['isDoctor']}>
                    <ProfileCompletionGuard>
                      <DoctorPortal />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                
                <Route path="/new-prescription" element={
                  <ProtectedRoute requiredPermissions={['isDoctor']}>
                    <ProfileCompletionGuard>
                      <NewPrescriptionPage />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />

                {/* Patient Management */}
                <Route path="/patient-management" element={
                  <ProtectedRoute requiredPermissions={['isDoctor']}>
                    <ProfileCompletionGuard>
                      <PatientManagement />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                
                {/* Placeholders - will be protected in the future */}
                <Route path="/services" element={<Services />} />
                <Route path="/doctors" element={<NotFound />} />
                <Route path="/lab-tests" element={<LabTests />} />
                <Route path="/lab-tests/book" element={<LabTestBooking />} />
                <Route path="/health-packages" element={<HealthPackages />} />
                <Route path="/contact" element={<NotFound />} />
                
                {/* Add the new route */}
                <Route path="/appointments" element={<AppointmentBookingPage />} />
                <Route path="/my-results" element={
                  <ProtectedRoute requiredPermissions={['isCustomer']}>
                    <ProfileCompletionGuard>
                      <TestResultsPage />
                    </ProfileCompletionGuard>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LabTestCartProvider>
      </PermissionsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
