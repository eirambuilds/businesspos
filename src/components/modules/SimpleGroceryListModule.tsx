
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileDown, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleGroceryListModuleProps {
  onClose: () => void;
}

export const SimpleGroceryListModule = ({ onClose }: SimpleGroceryListModuleProps) => {
  const { products, loading } = useProducts();
  const { toast } = useToast();

  const generateSimpleGroceryList = () => {
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    if (lowStockProducts.length === 0) {
      toast({
        title: "Walang kulang na stock",
        description: "Lahat ng produkto ay may sapat na stock pa.",
      });
      return;
    }

    const header = `GROCERY LIST - ${new Date().toLocaleDateString()}\n`;
    const separator = "=".repeat(50) + "\n";
    
    const itemsList = lowStockProducts
      .map((product, index) => {
        const neededQty = Math.max(30 - product.stock, 10);
        const size = product.product_size ? ` (${product.product_size})` : '';
        return `${index + 1}. ${product.product_name}${size} - ${neededQty} pcs`;
      })
      .join('\n');
    
    const totalProducts = lowStockProducts.length;
    const totalQuantity = lowStockProducts.reduce((sum, product) => {
      return sum + Math.max(30 - product.stock, 10);
    }, 0);
    
    const summary = `\n${separator}SUMMARY:\n` +
                   `Total Products: ${totalProducts}\n` +
                   `Total Quantity: ${totalQuantity} pieces\n` +
                   `Date Created: ${new Date().toLocaleDateString()}\n${separator}`;
    
    const content = header + separator + itemsList + summary;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Grocery list downloaded!",
      description: `Simple grocery list with ${totalProducts} items.`
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

  const lowStockCount = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Simple Grocery List</DialogTitle>
        <DialogDescription>
          Download a clean, printable grocery list for market shopping
        </DialogDescription>
      </DialogHeader>

      <div className="text-center py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="mx-auto p-3 bg-green-500 text-white rounded-full w-fit mb-4">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <CardTitle>Generate Simple Grocery List</CardTitle>
            <CardDescription>
              {lowStockCount > 0 ? (
                `May ${lowStockCount} na produkto na kailangan ng restock`
              ) : (
                "Walang produktong kulang na stock ngayon"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateSimpleGroceryList}
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={lowStockCount === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download Simple List
            </Button>
            {lowStockCount === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                All products have sufficient stock!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {lowStockCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items that will be included ({lowStockCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products
                .filter(p => p.stock < 10)
                .map((product, index) => {
                  const neededQty = Math.max(30 - product.stock, 10);
                  return (
                    <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium">{product.product_name}</span>
                        {product.product_size && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({product.product_size})
                          </span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Current stock: {product.stock}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{neededQty} pcs</div>
                        <div className="text-xs text-muted-foreground">needed</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
