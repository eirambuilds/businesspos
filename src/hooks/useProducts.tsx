import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  product_name: string;
  product_type: string;
  product_size?: string;
  quantity_per_pack: number;
  puhunan_per_pack: number;
  puhunan_each: number;
  selling_price: number;
  tubo: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error sa pag-load ng products",
        description: "Hindi ma-load ang mga produkto.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;
      
      toast({
        title: "Produkto nadagdag!",
        description: `${productData.product_name} ay naidagdag na sa inventory.`
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error sa pagdagdag",
        description: "Hindi ma-add ang produkto.",
        variant: "destructive"
      });
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Produkto na-update!",
        description: "Na-update na ang product details."
      });
      
      fetchProducts();
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error sa pag-update",
        description: "Hindi ma-update ang produkto.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Produkto na-delete!",
        description: "Na-delete na ang produkto."
      });
      
      fetchProducts();
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error sa pag-delete",
        description: "Hindi ma-delete ang produkto.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Stock na-update!",
        description: "Na-adjust ang stock ng produkto."
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error sa pag-update",
        description: "Hindi ma-update ang stock.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
};
