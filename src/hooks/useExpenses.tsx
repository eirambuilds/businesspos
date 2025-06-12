
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error sa pag-load ng Gastos",
        description: "Hindi ma-load ang mga gastos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (category: string, amount: number, description?: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          category,
          amount,
          description
        }]);

      if (error) throw error;
      
      // Log the activity
      await logActivity(
        'EXPENSE_CREATE',
        `Added expense: ₱${amount} for ${category}`,
        { category, amount, description }
      );
      
      toast({
        title: "Gastos naitala!",
        description: `₱${amount} para sa ${category} ay naitala na.`
      });
      
      fetchExpenses();
      return { success: true };
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error sa gastos",
        description: "Hindi ma-record ang gastos.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      // Get expense details before deleting for logging
      const { data: expenseToDelete } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      
      // Log the activity
      if (expenseToDelete) {
        await logActivity(
          'EXPENSE_DELETE',
          `Deleted expense: ₱${expenseToDelete.amount} for ${expenseToDelete.category}`,
          expenseToDelete
        );
      }
      
      toast({
        title: "Gastos na-delete!",
        description: "Na-delete na ang gastos record."
      });
      
      fetchExpenses();
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error sa pag-delete",
        description: "Hindi ma-delete ang gastos record.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTodaysTotal = () => {
    const today = new Date().toDateString();
    return expenses
      .filter(expense => new Date(expense.created_at).toDateString() === today)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMonthlyTotal = () => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return expenses
      .filter(expense => expense.created_at.startsWith(thisMonth))
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    getTodaysTotal,
    getMonthlyTotal,
    fetchExpenses
  };
};
