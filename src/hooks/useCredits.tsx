
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Credit {
  id: string;
  customer_name: string;
  amount_owed: number;
  items: any[];
  is_paid: boolean;
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
      
      // Cast the data to proper types
      const typedCredits = (data || []).map(credit => ({
        ...credit,
        items: Array.isArray(credit.items) ? credit.items : 
               typeof credit.items === 'string' ? JSON.parse(credit.items) : [],
        is_paid: credit.is_paid || false
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

  const markAsPaid = async (creditId: string) => {
    try {
      // Get the credit details first
      const { data: credit, error: fetchError } = await supabase
        .from('credits')
        .select('*')
        .eq('id', creditId)
        .single();

      if (fetchError) throw fetchError;

      // Update the credit as paid
      const { error } = await supabase
        .from('credits')
        .update({
          is_paid: true,
          paid_date: new Date().toISOString()
        })
        .eq('id', creditId);

      if (error) throw error;

      // Now record sales for each item to add to profit
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
        description: "Utang ay na-mark as paid na at naidagdag na sa sales."
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

  const getTotalUnpaid = () => {
    return credits
      .filter(credit => !credit.is_paid)
      .reduce((sum, credit) => sum + credit.amount_owed, 0);
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    credits,
    loading,
    addCredit,
    markAsPaid,
    getTotalUnpaid,
    fetchCredits
  };
};
