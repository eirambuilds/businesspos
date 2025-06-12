import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, FileDown, ListTodo, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedGroceryItem {
  id: string;
  product_name: string;
  current_stock: number;
  suggested_quantity: number;
  final_quantity: number;
  estimated_cost_per_unit: number;
  total_estimated_cost: number;
}

interface EnhancedGroceryListModuleProps {
  onClose: () => void;
}

export const EnhancedGroceryListModule = ({ onClose }: EnhancedGroceryListModuleProps) => {
  const { products, loading } = useProducts();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<EnhancedGroceryItem[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateGroceryList = () => {
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    const list: EnhancedGroceryItem[] = lowStockProducts.map(product => {
      const suggestedQty = Math.max(30 - product.stock, 10);
      const estimatedCost = product.puhunan_each || 0;
      
      return {
        id: product.id,
        product_name: product.product_name,
        current_stock: product.stock,
        suggested_quantity: suggestedQty,
        final_quantity: suggestedQty,
        estimated_cost_per_unit: estimatedCost,
        total_estimated_cost: estimatedCost * suggestedQty
      };
    });

    setGroceryList(list);
    setIsGenerated(true);

    toast({
      title: "Enhanced Grocery list generated!",
      description: `${list.length} items with cost estimates.`
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
        const newQuantity = Math.max(0, item.final_quantity + change);
        return {
          ...item,
          final_quantity: newQuantity,
          total_estimated_cost: item.estimated_cost_per_unit * newQuantity
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
          final_quantity: newQuantity,
          total_estimated_cost: item.estimated_cost_per_unit * newQuantity
        };
      }
      return item;
    }));
  };

  const totalEstimatedCost = groceryList.reduce((sum, item) => sum + item.total_estimated_cost, 0);
  const totalItems = groceryList.reduce((sum, item) => sum + item.final_quantity, 0);

  const generateDetailedPDF = () => {
    const header = `DETAILED GROCERY LIST - ${new Date().toLocaleDateString()}\n`;
    const separator = "=".repeat(50) + "\n";
    const itemsList = groceryList
      .map(item => 
        `${item.product_name}\n` +
        `  Current Stock: ${item.current_stock}\n` +
        `  Quantity Needed: ${item.final_quantity}\n` +
        `  Est. Cost per Unit: ₱${item.estimated_cost_per_unit.toFixed(2)}\n` +
        `  Total Cost: ₱${item.total_estimated_cost.toFixed(2)}\n`
      )
      .join('\n');
    
    const summary = `\n${separator}SUMMARY:\n` +
                   `Total Items: ${totalItems} pieces\n` +
                   `Total Estimated Cost: ₱${totalEstimatedCost.toFixed(2)}\n` +
                   `Number of Products: ${groceryList.length}\n${separator}`;
    
    const content = header + separator + itemsList + summary;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detailed-grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Detailed grocery list downloaded!",
      description: "Complete na ang grocery list with cost estimates."
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Enhanced Grocery List</DialogTitle>
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
        <DialogTitle className="text-2xl font-bold">Enhanced Grocery List</DialogTitle>
        <DialogDescription>
          Smart grocery list with cost estimates at budgeting
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Smart Restock List ({groceryList.length} items)</h3>
          <div className="flex space-x-2">
            <Button 
              onClick={generateDetailedPDF}
              className="bg-green-500 hover:bg-green-600"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download Detailed List
            </Button>
          </div>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalItems}
              </div>
              <p className="text-xs text-muted-foreground">pieces</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estimated Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₱{totalEstimatedCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">total cost</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {groceryList.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Current stock: {item.current_stock} pcs
                    </p>
                    <p className="text-xs text-blue-600">
                      Suggested: {item.suggested_quantity} pcs @ ₱{item.estimated_cost_per_unit.toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-6 w-6 p-0"
                        disabled={item.final_quantity <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.final_quantity}
                        onChange={(e) => updateQuantityDirect(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 h-6 text-center text-xs"
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
                    
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₱{item.total_estimated_cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.final_quantity} pcs
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};