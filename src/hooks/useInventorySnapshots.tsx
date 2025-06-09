
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventorySnapshot {
  id: string;
  snapshot_date: string;
  items: any[];
  total_items: number;
  created_at: string;
}

export const useInventorySnapshots = () => {
  const [snapshots, setSnapshots] = useState<InventorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_snapshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to proper types
      const typedSnapshots = (data || []).map(snapshot => ({
        ...snapshot,
        items: Array.isArray(snapshot.items) ? snapshot.items : []
      }));
      
      setSnapshots(typedSnapshots);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async () => {
    try {
      // Get current inventory
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      const snapshotData = {
        snapshot_date: new Date().toISOString().split('T')[0],
        items: products || [],
        total_items: (products || []).reduce((sum, p) => sum + p.stock, 0)
      };

      const { error } = await supabase
        .from('inventory_snapshots')
        .insert([snapshotData]);

      if (error) throw error;

      toast({
        title: "Inventory Snapshot Created!",
        description: `Naitala ang ending inventory para sa ${new Date().toLocaleDateString()}`
      });

      fetchSnapshots();
      return { success: true };
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast({
        title: "Error sa pag-create ng snapshot",
        description: "Hindi ma-create ang inventory snapshot.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const compareSnapshots = (current: InventorySnapshot, previous: InventorySnapshot) => {
    const currentItems = current.items || [];
    const previousItems = previous.items || [];
    
    return currentItems.map(currentItem => {
      const previousItem = previousItems.find(p => p.id === currentItem.id);
      const previousStock = previousItem ? previousItem.stock : 0;
      const difference = currentItem.stock - previousStock;
      
      return {
        ...currentItem,
        previousStock,
        difference,
        status: difference > 0 ? 'increased' : difference < 0 ? 'decreased' : 'same'
      };
    });
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  return {
    snapshots,
    loading,
    createSnapshot,
    compareSnapshots,
    fetchSnapshots
  };
};
