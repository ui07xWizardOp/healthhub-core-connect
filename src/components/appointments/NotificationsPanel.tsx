
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  Calendar, 
  Check, 
  XCircle, 
  Clock, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AppointmentNotification } from '@/types/supabase';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';

const NotificationsPanel = () => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notification data
  const { data: notifications, isLoading, error, refetch } = useSupabaseQuery<AppointmentNotification>(
    'appointment_notifications',
    {
      filters: (query) => {
        return query
          .eq('user_id', userProfile?.userid || 0)
          .order('created_at', { ascending: false });
      },
      enabled: !!userProfile?.userid,
    }
  );

  // Setup realtime subscription for notifications
  useEffect(() => {
    if (!userProfile?.userid) return;

    const notificationsChannel = supabase
      .channel('notification-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointment_notifications',
          filter: `user_id=eq.${userProfile.userid}`
        }, 
        () => {
          // Refresh notifications when there's a change
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [userProfile, refetch]);

  // Count unread notifications
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId);

      if (error) throw error;
      
      // Update local state
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userProfile?.userid || !notifications?.length) return;
    
    try {
      const { error } = await supabase
        .from('appointment_notifications')
        .update({ is_read: true })
        .eq('user_id', userProfile.userid)
        .eq('is_read', false);

      if (error) throw error;
      
      // Update local state
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'confirmation':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancellation':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reschedule':
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs h-8"
          >
            Mark all as read
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">
              Error loading notifications
            </div>
          ) : notifications?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div>
              {notifications?.map((notification) => (
                <div 
                  key={notification.notification_id} 
                  className={`
                    p-3 border-b hover:bg-muted/50 flex gap-3
                    ${!notification.is_read ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="mt-1">{getNotificationIcon(notification.notification_type)}</div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.notification_id)}
                          className="h-6 p-0 flex gap-1 items-center text-xs"
                        >
                          <Check className="h-3 w-3" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;
