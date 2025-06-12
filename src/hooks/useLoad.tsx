
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LoadSale {
  id: string;
  network: string;
  amount: number;
  kita: number;
  created_at: string;
}

export const useLoad = () => {
  const [loadSales, setLoadSales] = useState<LoadSale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLoadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('load_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoadSales(data || []);
    } catch (error) {
      console.error('Error fetching load sales:', error);
      toast({
        title: "Error sa pag-load ng Load sales",
        description: "Hindi ma-load ang mga load sales.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateKita = (amount: number) => {
    if (amount >= 5 && amount <= 90) return 3;
    if (amount >= 91 && amount <= 190) return 5;
    return 10;
  };

  const addLoadSale = async (network: string, amount: number) => {
    try {
      const kita = calculateKita(amount);
      
      const { error } = await supabase
        .from('load_sales')
        .insert([{
          network,
          amount,
          kita
        }]);

      if (error) throw error;
      
      toast({
        title: "Load sale recorded!",
        description: `₱${amount} ${network} load - Kita: ₱${kita}`
      });
      
      fetchLoadSales();
      return { success: true };
    } catch (error) {
      console.error('Error adding load sale:', error);
      toast({
        title: "Error sa load sale",
        description: "Hindi ma-record ang load sale.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTodaysKita = () => {
    const today = new Date().toDateString();
    return loadSales
      .filter(sale => new Date(sale.created_at).toDateString() === today)
      .reduce((sum, sale) => sum + sale.kita, 0);
  };

  const getWeeklyKita = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return loadSales
      .filter(sale => new Date(sale.created_at) >= weekStart)
      .reduce((sum, sale) => sum + sale.kita, 0);
  };

  const getMonthlyKita = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return loadSales
      .filter(sale => new Date(sale.created_at) >= monthStart)
      .reduce((sum, sale) => sum + sale.kita, 0);
  };

  const getYearlyKita = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return loadSales
      .filter(sale => new Date(sale.created_at) >= yearStart)
      .reduce((sum, sale) => sum + sale.kita, 0);
  };

  const getTodaysLoadSales = () => {
    const today = new Date().toDateString();
    return loadSales
      .filter(sale => new Date(sale.created_at).toDateString() === today)
      .reduce((sum, sale) => sum + sale.amount, 0);
  };

  useEffect(() => {
    fetchLoadSales();
  }, []);

  return {
    transactions: loadSales, // Add alias for compatibility
    loadSales,
    loading,
    addLoadSale,
    getTodaysKita,
    getWeeklyKita,
    getMonthlyKita,
    getYearlyKita,
    getTodaysLoadSales,
    fetchLoadSales
  };
};
