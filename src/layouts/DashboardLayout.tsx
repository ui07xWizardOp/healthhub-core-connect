
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  PillIcon, 
  TestTube, 
  ShoppingCart, 
  User,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Pharmacy', 
      path: '/pharmacy', 
      icon: PillIcon 
    },
    { 
      name: 'Laboratory', 
      path: '/laboratory', 
      icon: TestTube 
    },
    { 
      name: 'Customers', 
      path: '/customers', 
      icon: Users 
    },
    { 
      name: 'Inventory', 
      path: '/inventory', 
      icon: ShoppingCart 
    },
    { 
      name: 'Employees', 
      path: '/employees', 
      icon: User 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings 
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-[#FEFEFF]">
        <Sidebar variant="inset">
          <SidebarHeader className="border-b border-border">
            <div className="px-5 py-2">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-healthhub-orange">HealthHub</h1>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.path}
                    tooltip={item.name}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6EFFF]">
                <User className="h-4 w-4 text-healthhub-orange" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@healthhub.com</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
