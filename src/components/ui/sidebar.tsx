import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  Users,
  UserPlus,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
  ClipboardList,
  UserCog,
  Stethoscope,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Skeleton } from './skeleton';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const Sidebar = () => {
  const { signOut, userProfile, loading } = useAuth();
  const [navigation, setNavigation] = useState<NavItem[]>([]);

  useEffect(() => {
    if (userProfile?.roles?.includes('Admin')) {
      setNavigation([
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', href: '/appointments', icon: Calendar },
        { label: 'Products', href: '/products', icon: ListChecks },
        { label: 'Users', href: '/users', icon: Users },
        { label: 'Add User', href: '/register', icon: UserPlus },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Help', href: '/help', icon: HelpCircle },
      ]);
    } else if (userProfile?.roles?.includes('Doctor')) {
      setNavigation([
        { label: 'Doctor Portal', href: '/doctor-portal', icon: Stethoscope },
        { label: 'Patient Management', href: '/patient-management', icon: UserCog },
        { label: 'Customers', href: '/customers', icon: Users },
        { label: 'Settings', href: '/settings', icon: Settings },
      ]);
    } else if (userProfile?.roles?.includes('Staff')) {
      setNavigation([
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', href: '/appointments', icon: Calendar },
        { label: 'Settings', href: '/settings', icon: Settings },
        { label: 'Help', href: '/help', icon: HelpCircle },
      ]);
    } else {
      setNavigation([
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', href: '/appointments', icon: Calendar },
        { label: 'Help', href: '/help', icon: HelpCircle },
      ]);
    }
  }, [userProfile]);

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Acme Corp</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {loading ? (
            <>
              <Skeleton className="h-10 w-4/5 mx-auto my-2 rounded-md" />
              <Skeleton className="h-10 w-4/5 mx-auto my-2 rounded-md" />
              <Skeleton className="h-10 w-4/5 mx-auto my-2 rounded-md" />
            </>
          ) : (
            navigation.map((item) => (
              <li key={item.label} className="mb-1">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                      isActive ? 'font-semibold bg-gray-200' : ''
                    }`
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            ))
          )}
        </ul>
      </nav>
      <div className="p-4">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
