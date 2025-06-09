
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LiabilityStatus = 'paid' | 'unpaid';

export interface Liability {
  id: string;
  type: string;
  person_involved: string;
  amount: number;
  description: string;
  status: LiabilityStatus;
  due_date?: string;
  created_at: string;
}

export const useLiabilities = () => {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLiabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to proper types
      const typedLiabilities = (data || []).map(liability => ({
        ...liability,
        status: (liability.status as LiabilityStatus) || 'unpaid'
      }));
      
      setLiabilities(typedLiabilities);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      toast({
        title: "Error sa pag-load ng Liabilities",
        description: "Hindi ma-load ang mga liability records.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLiability = async (liability: Omit<Liability, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('liabilities')
        .insert([liability]);

      if (error) throw error;
      
      toast({
        title: "Liability naidagdag!",
        description: `${liability.type} sa ${liability.person_involved} ay naitala na.`
      });
      
      fetchLiabilities();
      return { success: true };
    } catch (error) {
      console.error('Error adding liability:', error);
      toast({
        title: "Error sa pag-record ng liability",
        description: "Hindi ma-record ang liability.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateLiabilityStatus = async (id: string, status: LiabilityStatus) => {
    try {
      const { error } = await supabase
        .from('liabilities')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Status na-update!",
        description: `Liability ay na-mark as ${status}.`
      });
      
      fetchLiabilities();
      return { success: true };
    } catch (error) {
      console.error('Error updating liability status:', error);
      toast({
        title: "Error sa pag-update ng status",
        description: "Hindi ma-update ang liability status.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTotalUnpaid = () => {
    return liabilities
      .filter(liability => liability.status === 'unpaid')
      .reduce((sum, liability) => sum + liability.amount, 0);
  };

  useEffect(() => {
    fetchLiabilities();
  }, []);

  return {
    liabilities,
    loading,
    addLiability,
    updateLiabilityStatus,
    getTotalUnpaid,
    fetchLiabilities
  };
};
