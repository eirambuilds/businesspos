
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, FileDown, ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroceryItem {
  id: string;
  product_name: string;
  current_stock: number;
  suggested_quantity: number;
  final_quantity: number;
}

interface GroceryListModuleProps {
  onClose: () => void;
}

export const GroceryListModule = ({ onClose }: GroceryListModuleProps) => {
  const { products, loading } = useProducts();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateGroceryList = () => {
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    const list: GroceryItem[] = lowStockProducts.map(product => ({
      id: product.id,
      product_name: product.product_name,
      current_stock: product.stock,
      suggested_quantity: Math.max(50 - product.stock, 10), // Suggest to restock to 50 or minimum 10
      final_quantity: Math.max(50 - product.stock, 10)
    }));

    setGroceryList(list);
    setIsGenerated(true);

    toast({
      title: "Grocery list generated!",
      description: `${list.length} items na kulang na stock ay naidagdag sa list.`
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setGroceryList(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, final_quantity: Math.max(0, item.final_quantity + change) }
        : item
    ));
  };

  const generatePDF = () => {
    // Create a simple text format for now - in a real app you'd use a PDF library
    const listText = groceryList
      .map(item => `${item.product_name}: ${item.final_quantity} pcs (Current: ${item.current_stock})`)
      .join('\n');
    
    const blob = new Blob([`GROCERY LIST - ${new Date().toLocaleDateString()}\n\n${listText}`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Grocery list downloaded!",
      description: "Na-download na ang grocery list file."
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Grocery List</DialogTitle>
          <DialogDescription>Loading...</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Grocery List</DialogTitle>
        <DialogDescription>
          I-generate ang restock list para sa mga produktong maubos na
        </DialogDescription>
      </DialogHeader>

      {!isGenerated ? (
        <div className="text-center py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="mx-auto p-3 bg-indigo-500 text-white rounded-full w-fit mb-4">
                <ListTodo className="h-8 w-8" />
              </div>
              <CardTitle>Generate Grocery List</CardTitle>
              <CardDescription>
                May {lowStockCount} na produkto na kulang na stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={generateGroceryList}
                className="w-full bg-indigo-500 hover:bg-indigo-600"
                disabled={lowStockCount === 0}
              >
                Gumawa ng Listahan
              </Button>
              {lowStockCount === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Walang produktong kulang na stock ngayon!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Restock List ({groceryList.length} items)</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsGenerated(false)}
              >
                Generate New List
              </Button>
              <Button 
                onClick={generatePDF}
                className="bg-green-500 hover:bg-green-600"
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
                        Current stock: {item.current_stock} pcs
                      </p>
                      <p className="text-xs text-blue-600">
                        Suggested: {item.suggested_quantity} pcs
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
                          onChange={(e) => {
                            const newValue = Math.max(0, parseInt(e.target.value) || 0);
                            setGroceryList(prev => prev.map(listItem => 
                              listItem.id === item.id 
                                ? { ...listItem, final_quantity: newValue }
                                : listItem
                            ));
                          }}
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
                          {item.final_quantity} pcs
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Total Items to Buy:</h4>
              <p className="text-2xl font-bold text-blue-600">
                {groceryList.reduce((total, item) => total + item.final_quantity, 0)} pieces
              </p>
              <p className="text-sm text-muted-foreground">
                Across {groceryList.length} different products
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
