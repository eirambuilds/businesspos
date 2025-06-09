
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Edit, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryModuleProps {
  onClose: () => void;
}

export const InventoryModule = ({ onClose }: InventoryModuleProps) => {
  const { products, loading, addProduct, updateStock } = useProducts();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [restockQuantities, setRestockQuantities] = useState<{[key: string]: string}>({});
  
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    product_type: '',
    product_size: '',
    quantity_per_pack: 1,
    puhunan_per_pack: 0,
    puhunan_each: 0,
    selling_price: 0,
    tubo: 0,
    stock: 0
  });

  const calculateTubo = (puhunanEach: number, sellingPrice: number) => {
    return sellingPrice - puhunanEach;
  };

  const handleAddProduct = async () => {
    if (!newProduct.product_name || !newProduct.product_type) {
      toast({
        title: "Kulang ang datos!",
        description: "I-fill ang product name at type.",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...newProduct,
      puhunan_each: newProduct.puhunan_per_pack / newProduct.quantity_per_pack,
      tubo: calculateTubo(newProduct.puhunan_per_pack / newProduct.quantity_per_pack, newProduct.selling_price)
    };

    await addProduct(productData);
    setNewProduct({
      product_name: '',
      product_type: '',
      product_size: '',
      quantity_per_pack: 1,
      puhunan_per_pack: 0,
      puhunan_each: 0,
      selling_price: 0,
      tubo: 0,
      stock: 0
    });
    setShowAddDialog(false);
  };

  const handleRestock = async (productId: string) => {
    const quantity = parseInt(restockQuantities[productId] || '0');
    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "I-enter ang valid na quantity.",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      await updateStock(productId, product.stock + quantity);
      setRestockQuantities(prev => ({ ...prev, [productId]: '' }));
      toast({
        title: "Stock updated!",
        description: `Naidagdag ang ${quantity} pieces sa ${product.product_name}.`
      });
    }
  };

  const handleRestockQuantityChange = (productId: string, value: string) => {
    setRestockQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const lowStockProducts = products.filter(p => p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.selling_price * p.stock), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Inventory Management</DialogTitle>
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
        <DialogTitle className="text-2xl font-bold">Inventory Management</DialogTitle>
        <DialogDescription>
          I-manage ang mga produkto at stock levels
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">mga item</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">kulang na</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">ubos na</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₱{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">inventory value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">I-manage</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mga Produkto</h3>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{product.product_name}</h4>
                        {product.stock <= 0 && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                        {product.stock > 0 && product.stock < 10 && (
                          <Badge variant="secondary">Low Stock</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>Stock: <span className="font-medium">{product.stock}</span></div>
                        <div>Price: <span className="font-medium">₱{product.selling_price}</span></div>
                        <div>Cost: <span className="font-medium">₱{product.puhunan_each}</span></div>
                        <div>Profit: <span className="font-medium">₱{product.tubo}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Flexible Restock Input */}
                      <div className="flex items-center space-x-1">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={restockQuantities[product.id] || ''}
                          onChange={(e) => handleRestockQuantityChange(product.id, e.target.value)}
                          className="w-16 h-8 text-xs"
                          min="1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRestock(product.id)}
                          disabled={!restockQuantities[product.id] || parseInt(restockQuantities[product.id]) <= 0}
                          className="h-8 px-2 text-xs bg-green-500 hover:bg-green-600"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Restock
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <h3 className="text-lg font-semibold">Stock Alerts</h3>
          
          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Out of Stock ({outOfStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="font-medium">{product.product_name}</span>
                      <Badge variant="destructive">0 stock</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <CardHeader>
                <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Low Stock ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <span className="font-medium">{product.product_name}</span>
                      <Badge variant="secondary">{product.stock} left</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4" />
            <p>Inventory reports and analytics</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Magdagdag ng bagong produkto sa inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={newProduct.product_name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="e.g. Coca Cola"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="product-type">Type</Label>
                <Input
                  id="product-type"
                  value={newProduct.product_type}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, product_type: e.target.value }))}
                  placeholder="e.g. Drinks"
                />
              </div>
              <div>
                <Label htmlFor="product-size">Size</Label>
                <Input
                  id="product-size"
                  value={newProduct.product_size}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, product_size: e.target.value }))}
                  placeholder="e.g. 330ml"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="quantity-per-pack">Qty per Pack</Label>
                <Input
                  id="quantity-per-pack"
                  type="number"
                  value={newProduct.quantity_per_pack}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, quantity_per_pack: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="puhunan-per-pack">Puhunan per Pack</Label>
                <Input
                  id="puhunan-per-pack"
                  type="number"
                  step="0.01"
                  value={newProduct.puhunan_per_pack}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, puhunan_per_pack: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="selling-price">Selling Price</Label>
                <Input
                  id="selling-price"
                  type="number"
                  step="0.01"
                  value={newProduct.selling_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="initial-stock">Initial Stock</Label>
                <Input
                  id="initial-stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
