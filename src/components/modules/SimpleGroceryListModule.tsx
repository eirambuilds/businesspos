import { useState, useEffect } from 'react'; // Added useEffect
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, FileDown, ListTodo, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroceryItem {
  id: string;
  product_name: string;
  product_size?: string;
  current_stock: number;
  needed_quantity: number;
}

interface SimpleGroceryListModuleProps {
  onClose: () => void;
}

export const SimpleGroceryListModule = ({ onClose }: SimpleGroceryListModuleProps) => {
  const { products, loading } = useProducts();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateGroceryList = () => {
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    const list: GroceryItem[] = lowStockProducts.map(product => ({
      id: product.id,
      product_name: product.product_name,
      product_size: product.product_size,
      current_stock: product.stock,
      needed_quantity: Math.max(30 - product.stock, 10)
    }));

    setGroceryList(list);
    setIsGenerated(true);

    toast({
      title: "Simple grocery list generated!",
      description: `${list.length} items ready for shopping.`
    });
  };

  // Automatically generate list when products are loaded
  useEffect(() => {
    if (!loading && products.length > 0) {
      generateGroceryList();
    }
  }, [loading, products]);

  const updateQuantity = (productId: string, change: number) => {
    setGroceryList(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          needed_quantity: Math.max(0, item.needed_quantity + change)
        };
      }
      return item;
    }));
  };

  const updateQuantityDirect = (productId: string, newQuantity: number) => {
    setGroceryList(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          needed_quantity: Math.max(0, newQuantity)
        };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== productId));
  };

  const downloadSimpleList = () => {
    const activeItems = groceryList.filter(item => item.needed_quantity > 0);
    const totalProducts = activeItems.length;
    const totalQuantity = activeItems.reduce((sum, item) => sum + item.needed_quantity, 0);
    
    const listContent = `GROCERY LIST - ${new Date().toLocaleDateString()}\n` +
      `${"=".repeat(40)}\n\n` +
      activeItems.map(item => 
        `${item.product_name}${item.product_size ? ` (${item.product_size})` : ''}\n` +
        `Needed: ${item.needed_quantity} pcs\n`
      ).join('\n') +
      `\n${"=".repeat(40)}\n` +
      `SUMMARY:\n` +
      `Total Products: ${totalProducts}\n` +
      `Total Quantity: ${totalQuantity} pieces\n` +
      `${"=".repeat(40)}`;
    
    const blob = new Blob([listContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simple-grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Simple grocery list downloaded!",
      description: "Clean list ready for market shopping."
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Simple Grocery List</DialogTitle>
          <DialogDescription>Loading...</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Simple Grocery List</DialogTitle>
        <DialogDescription>
          Clean, printable grocery list para sa market
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Shopping List ({groceryList.filter(item => item.needed_quantity > 0).length} items)</h3>
          <div className="flex space-x-2">
            <Button 
              onClick={downloadSimpleList}
              className="bg-green-500 hover:bg-green-600"
              disabled={groceryList.filter(item => item.needed_quantity > 0).length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download List
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {groceryList.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.product_size && `${item.product_size} • `}
                      Current stock: {item.current_stock} pcs
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-6 w-6 p-0"
                        disabled={item.needed_quantity <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.needed_quantity}
                        onChange={(e) => updateQuantityDirect(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 h-6 text-center text-xs"
                        min="0"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {groceryList.filter(item => item.needed_quantity > 0).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-4" />
            <p>No items in grocery list</p>
            <p className="text-sm">Adjust quantities or regenerate the list</p>
          </div>
        )}
      </div>
    </div>
  );
};