
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from './useProducts';

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error sa pag-load ng sales",
        description: "Hindi ma-load ang mga sales records.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processSale = async (cartItems: CartItem[], paymentMethod: string = 'cash') => {
    try {
      // Insert sales records and update stock
      for (const item of cartItems) {
        // Insert sale record
        const { error: saleError } = await supabase
          .from('sales')
          .insert([{
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.selling_price,
            total_amount: item.subtotal,
            payment_method: paymentMethod
          }]);

        if (saleError) throw saleError;

        // Update product stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: item.stock - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      toast({
        title: "Naitala ang benta!",
        description: `₱${totalAmount.toLocaleString()} ang kabuuang sale.`
      });
      
      fetchSales();
      return { success: true };
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: "Error sa pag-record ng sale",
        description: "Hindi ma-record ang benta.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return sales
      .filter(sale => new Date(sale.created_at).toDateString() === today)
      .reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  const getWeeklySales = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return sales
      .filter(sale => new Date(sale.created_at) >= weekStart)
      .reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  const getMonthlySales = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return sales
      .filter(sale => new Date(sale.created_at) >= monthStart)
      .reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  const getYearlySales = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return sales
      .filter(sale => new Date(sale.created_at) >= yearStart)
      .reduce((sum, sale) => sum + sale.total_amount, 0);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    fetchSales,
    processSale,
    getTodaysSales,
    getWeeklySales,
    getMonthlySales,
    getYearlySales
  };
};
