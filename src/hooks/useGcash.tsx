
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GcashTransaction {
  id: string;
  amount: number;
  kita: number;
  transaction_type: string;
  created_at: string;
}

export const useGcash = () => {
  const [transactions, setTransactions] = useState<GcashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('gcash_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching GCash transactions:', error);
      toast({
        title: "Error sa pag-load ng GCash",
        description: "Hindi ma-load ang mga transactions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateKita = (amount: number) => {
    if (amount >= 5 && amount <= 500) return 10;
    if (amount >= 501 && amount <= 1000) return 20;
    if (amount >= 1001 && amount <= 1500) return 30;
    if (amount >= 1501 && amount <= 2000) return 40;
    if (amount >= 2001 && amount <= 2500) return 50;
    return Math.floor((amount - 2500) / 500) * 10 + 50;
  };

  const addTransaction = async (amount: number, transactionType: string) => {
    try {
      const kita = calculateKita(amount);
      
      const { error } = await supabase
        .from('gcash_transactions')
        .insert([{
          amount,
          kita,
          transaction_type: transactionType
        }]);

      if (error) throw error;
      
      toast({
        title: "GCash transaction recorded!",
        description: `₱${amount} ${transactionType} - Kita: ₱${kita}`
      });
      
      fetchTransactions();
      return { success: true };
    } catch (error) {
      console.error('Error adding GCash transaction:', error);
      toast({
        title: "Error sa GCash transaction",
        description: "Hindi ma-record ang transaction.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTodaysKita = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => new Date(transaction.created_at).toDateString() === today)
      .reduce((sum, transaction) => sum + transaction.kita, 0);
  };

  const getWeeklyKita = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return transactions
      .filter(transaction => new Date(transaction.created_at) >= weekStart)
      .reduce((sum, transaction) => sum + transaction.kita, 0);
  };

  const getMonthlyKita = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions
      .filter(transaction => new Date(transaction.created_at) >= monthStart)
      .reduce((sum, transaction) => sum + transaction.kita, 0);
  };

  const getYearlyKita = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return transactions
      .filter(transaction => new Date(transaction.created_at) >= yearStart)
      .reduce((sum, transaction) => sum + transaction.kita, 0);
  };

  const getTodaysGcashSales = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => new Date(transaction.created_at).toDateString() === today)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    getTodaysKita,
    getWeeklyKita,
    getMonthlyKita,
    getYearlyKita,
    getTodaysGcashSales,
    fetchTransactions
  };
};
