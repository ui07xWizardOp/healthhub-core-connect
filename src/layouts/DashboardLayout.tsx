
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PillIcon, 
  TestTube, 
  ShoppingCart, 
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import NotificationsPanel from '@/components/appointments/NotificationsPanel';
import Sidebar from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { getAvailableRoutes } = usePermissions();

  // Get available routes based on user permissions
  const availableRoutes = getAvailableRoutes();

  // Map icon strings to components
  const iconMap: Record<string, React.ElementType> = {
    'LayoutDashboard': LayoutDashboard,
    'PillIcon': PillIcon,
    'TestTube': TestTube,
    'Users': Users,
    'ShoppingCart': ShoppingCart,
    'User': User,
    'Settings': Settings
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="flex min-h-svh w-full bg-[#FEFEFF]">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border px-6 flex items-center justify-end gap-3">
          <NotificationsPanel />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6EFFF]">
              <User className="h-4 w-4 text-healthhub-orange" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {userProfile ? `${userProfile.firstname} ${userProfile.lastname}` : 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {userProfile?.roles?.join(', ') || 'No role assigned'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
