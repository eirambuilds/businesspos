
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface CustomerTransaction {
  id: string;
  customer_name: string;
  type: 'sale' | 'credit' | 'payment';
  amount: number;
  description: string;
  created_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([customer]);

      if (error) throw error;

      toast({
        title: "Customer Added!",
        description: `${customer.name} ay naidagdag na sa customer list.`
      });

      fetchCustomers();
      return { success: true };
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Hindi ma-add ang customer.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getCustomerTransactions = async (customerName: string) => {
    try {
      // Get credits
      const { data: credits, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('customer_name', customerName)
        .order('created_at', { ascending: false });

      if (creditsError) throw creditsError;

      // Transform credits to transactions
      const transactions: CustomerTransaction[] = (credits || []).map(credit => ({
        id: credit.id,
        customer_name: credit.customer_name,
        type: credit.is_paid ? 'payment' : 'credit',
        amount: credit.amount_owed,
        description: `${credit.is_paid ? 'Payment for' : 'Credit for'} items`,
        created_at: credit.is_paid ? (credit.paid_date || credit.created_at) : credit.created_at
      }));

      return transactions;
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    addCustomer,
    getCustomerTransactions,
    fetchCustomers
  };
};
