
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
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (actionType: string, description: string, affectedData?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          action_type: actionType,
          description: description,
          user_email: user?.email || 'Unknown',
          affected_data: affectedData || {}
        }]);

      if (error) throw error;
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
