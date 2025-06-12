
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  user_email: string;
  affected_data: any;
  created_at: string;
}

export const useActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Fetched activity logs:', data);
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error loading activity logs",
        description: "Could not load activity logs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (actionType: string, description: string, affectedData?: any) => {
    try {
      console.log('Logging activity:', { actionType, description, affectedData });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
          action_type: actionType,
          description: description,
          user_email: user?.email || 'Unknown',
          affected_data: affectedData || {}
        }])
        .select();

      if (error) {
        console.error('Error inserting activity log:', error);
        throw error;
      }

      console.log('Activity logged successfully:', data);
      
      // Refresh logs after adding new one
      fetchLogs();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    logActivity,
    fetchLogs
  };
};
