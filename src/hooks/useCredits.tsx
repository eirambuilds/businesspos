import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Credit {
  id: string;
  customer_name: string;
  amount_owed: number;
  total_amount: number; // Add alias for compatibility
  items: any[];
  is_paid: boolean;
  status: 'paid' | 'unpaid'; // Add computed status
  paid_date?: string;
  created_at: string;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to proper types and add computed properties
      const typedCredits = (data || []).map(credit => ({
        ...credit,
        items: Array.isArray(credit.items) ? credit.items : 
               typeof credit.items === 'string' ? JSON.parse(credit.items) : [],
        is_paid: credit.is_paid || false,
        total_amount: credit.amount_owed, // Add alias
        status: (credit.is_paid ? 'paid' : 'unpaid') as 'paid' | 'unpaid' // Add computed status
      }));
      
      setCredits(typedCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error sa pag-load ng Utang",
        description: "Hindi ma-load ang mga utang records.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCredit = async (customerName: string, items: any[], totalAmount: number) => {
    try {
      // First, deduct stock for products in the cart
      for (const item of items) {
        if (item.type === 'paninda') {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock: item.stock - item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (stockError) {
            console.error('Error updating stock:', stockError);
            throw stockError;
          }
        }
      }

      // Then insert the credit record
      const { error } = await supabase
        .from('credits')
        .insert([{
          customer_name: customerName,
          amount_owed: totalAmount,
          items: items
        }]);

      if (error) throw error;
      
      toast({
        title: "Utang naitala!",
        description: `₱${totalAmount} utang ni ${customerName} ay naitala na.`
      });
      
      fetchCredits();
      return { success: true };
    } catch (error) {
      console.error('Error adding credit:', error);
      toast({
        title: "Error sa pag-record ng utang",
        description: "Hindi ma-record ang utang.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const addToRevenue = async (credit: any) => {
    // Check if items contain load, gcash, or bills services
    const itemsArray = Array.isArray(credit.items) ? credit.items :
                      typeof credit.items === 'string' ? JSON.parse(credit.items) : [];
    
    for (const item of itemsArray) {
      if (item && item.type === 'load') {
        // Add to load sales
        const { error } = await supabase
          .from('load_sales')
          .insert([{
            network: item.network || 'Unknown',
            amount: item.amount || (item.selling_price * (item.quantity || 1)),
            kita: item.kita || ((item.amount || (item.selling_price * (item.quantity || 1))) * 0.05) // Default 5% commission if not specified
          }]);
        
        if (error) console.error('Error adding to load sales:', error);
      } else if (item && item.type === 'gcash') {
        // Add to gcash transactions
        const { error } = await supabase
          .from('gcash_transactions')
          .insert([{
            transaction_type: item.transaction_type || 'Cash In',
            amount: item.amount || (item.selling_price * (item.quantity || 1)),
            kita: item.kita || ((item.amount || (item.selling_price * (item.quantity || 1))) * 0.02) // Default 2% commission if not specified
          }]);
        
        if (error) console.error('Error adding to gcash transactions:', error);
      } else if (item && item.type === 'bills') {
        // Add to bills payments
        const calculatedAmount = item.amount || (item.selling_price * (item.quantity || 1));
        const { error } = await supabase
          .from('bills_payments')
          .insert([{
            bill_type: item.bill_type || 'Unknown',
            amount: calculatedAmount,
            commission: item.commission || calculateBillsCommission(calculatedAmount)
          }]);
        
        if (error) console.error('Error adding to bills payments:', error);
      }
    }
  };

  const calculateBillsCommission = (amount: number): number => {
    if (amount < 5) return 0;
    return amount <= 1000 ? Math.ceil(Math.max(amount, 500) / 500) * 10 : 20 + Math.floor((amount - 1000) / 500) * 10;
  };

  const markAsPaid = async (creditId: string) => {
    try {
      // Get the credit details first
      const { data: credit, error: fetchError } = await supabase
        .from('credits')
        .select('*')
        .eq('id', creditId)
        .single();

      if (fetchError) throw fetchError;
      if (!credit) throw new Error('Credit not found');

      // Update the credit as paid
      const { error } = await supabase
        .from('credits')
        .update({
          is_paid: true,
          paid_date: new Date().toISOString()
        })
        .eq('id', creditId);

      if (error) throw error;

      // Add to revenue if items contain load, gcash, or bills
      await addToRevenue(credit);

      // Now record sales for products to add to profit
      const itemsArray = Array.isArray(credit.items) ? credit.items :
                        typeof credit.items === 'string' ? JSON.parse(credit.items) : [];
      
      for (const item of itemsArray) {
        if (item.type === 'paninda') {
          // Insert sale record for the product
          const { error: saleError } = await supabase
            .from('sales')
            .insert([{
              product_id: item.id,
              quantity: item.quantity,
              unit_price: item.selling_price,
              total_amount: item.selling_price * item.quantity,
              payment_method: 'credit'
            }]);

          if (saleError) {
            console.error('Error recording sale:', saleError);
          }
        }
      }
      
      toast({
        title: "Utang nabayad!",
        description: "Utang ay na-mark as paid na at naidagdag na sa revenue."
      });
      
      fetchCredits();
      return { success: true };
    } catch (error) {
      console.error('Error marking credit as paid:', error);
      toast({
        title: "Error sa pag-update ng utang",
        description: "Hindi ma-update ang utang.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateCreditStatus = async (creditId: string, newStatus: 'paid' | 'unpaid') => {
    if (newStatus === 'paid') {
      return await markAsPaid(creditId);
    } else {
      try {
        const { error } = await supabase
          .from('credits')
          .update({
            is_paid: false,
            paid_date: null
          })
          .eq('id', creditId);

        if (error) throw error;
        
        toast({
          title: "Status updated!",
          description: `Credit status changed to ${newStatus}.`
        });
        
        fetchCredits();
        return { success: true };
      } catch (error) {
        console.error('Error updating credit status:', error);
        toast({
          title: "Error sa pag-update ng utang",
          description: "Hindi ma-update ang utang.",
          variant: "destructive"
        });
        return { success: false };
      }
    }
  };

  const getTotalUnpaid = () => {
    return credits
      .filter(credit => !credit.is_paid)
      .reduce((sum, credit) => sum + credit.amount_owed, 0);
  };

  // Group credits by customer name (case-insensitive)
  const getGroupedCredits = () => {
    const grouped: { [key: string]: Credit[] } = {};
    
    credits.forEach(credit => {
      const normalizedName = credit.customer_name.toLowerCase().trim();
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = [];
      }
      grouped[normalizedName].push(credit);
    });
    
    return grouped;
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    credits,
    loading,
    addCredit,
    markAsPaid,
    updateCreditStatus,
    getTotalUnpaid,
    getGroupedCredits,
    fetchCredits
  };
};
