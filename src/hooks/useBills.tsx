
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BillPayment {
  id: string;
  bill_type: string;
  amount: number;
  commission: number;
  created_at: string;
}

export const useBills = () => {
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBillPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('bills_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBillPayments(data || []);
    } catch (error) {
      console.error('Error fetching bill payments:', error);
      toast({
        title: "Error sa pag-load ng Bills",
        description: "Hindi ma-load ang mga bill payments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = (amount: number) => {
    if (amount >= 5 && amount <= 500) return 10;
    if (amount >= 501 && amount <= 1000) return 20;
    return Math.floor((amount - 1000) / 500) * 10 + 20;
  };

  const addBillPayment = async (billType: string, amount: number) => {
    try {
      const commission = calculateCommission(amount);
      
      const { error } = await supabase
        .from('bills_payments')
        .insert([{
          bill_type: billType,
          amount,
          commission
        }]);

      if (error) throw error;
      
      toast({
        title: "Bill payment recorded!",
        description: `₱${amount} ${billType} - Commission: ₱${commission}`
      });
      
      fetchBillPayments();
      return { success: true };
    } catch (error) {
      console.error('Error adding bill payment:', error);
      toast({
        title: "Error sa bill payment",
        description: "Hindi ma-record ang bill payment.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTodaysKita = () => {
    const today = new Date().toDateString();
    return billPayments
      .filter(payment => new Date(payment.created_at).toDateString() === today)
      .reduce((sum, payment) => sum + payment.commission, 0);
  };

  const getWeeklyKita = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return billPayments
      .filter(payment => new Date(payment.created_at) >= weekStart)
      .reduce((sum, payment) => sum + payment.commission, 0);
  };

  const getMonthlyKita = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return billPayments
      .filter(payment => new Date(payment.created_at) >= monthStart)
      .reduce((sum, payment) => sum + payment.commission, 0);
  };

  const getYearlyKita = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return billPayments
      .filter(payment => new Date(payment.created_at) >= yearStart)
      .reduce((sum, payment) => sum + payment.commission, 0);
  };

  const getTodaysBillsSales = () => {
    const today = new Date().toDateString();
    return billPayments
      .filter(payment => new Date(payment.created_at).toDateString() === today)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  useEffect(() => {
    fetchBillPayments();
  }, []);

  return {
    transactions: billPayments, // Add alias for compatibility
    billPayments,
    loading,
    addBillPayment,
    getTodaysKita,
    getWeeklyKita,
    getMonthlyKita,
    getYearlyKita,
    getTodaysBillsSales,
    fetchBillPayments
  };
};
