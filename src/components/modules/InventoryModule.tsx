import { useState } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Minus, Edit, AlertTriangle } from 'lucide-react';
import { DialogHeader as ModuleDialogHeader, DialogTitle as ModuleDialogTitle, DialogDescription as ModuleDialogDescription } from '@/components/ui/dialog';

interface InventoryModuleProps {
  onClose: () => void;
}

export const InventoryModule = ({ onClose }: InventoryModuleProps) => {
  const { products, loading, addProduct, updateStock } = useProducts();
  const [activeTab, setActiveTab] = useState('view');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    product_name: '',
    product_type: 'Cigarette',
    product_size: '',
    stock: 0,
    quantity_per_pack: 1,
    puhunan_per_pack: 0,
    puhunan_each: 0,
    tubo: 0,
    selling_price: 0
  });

  const handleStockUpdate = async (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStock = Math.max(0, product.stock + change);
    await updateStock(productId, newStock);
  };

  const handleAddProduct = async () => {
    if (!newProduct.product_name || !newProduct.selling_price) {
      return;
    }
    
    await addProduct(newProduct);
    setNewProduct({
      product_name: '',
      product_type: 'Cigarette',
      product_size: '',
      stock: 0,
      quantity_per_pack: 1,
      puhunan_per_pack: 0,
      puhunan_each: 0,
      tubo: 0,
      selling_price: 0
    });
    setShowAddProduct(false);
  };

  const lowStockProducts = products.filter(p => p.stock < 10);

  if (loading) {
    return (
      <div className="space-y-6">
        <ModuleDialogHeader>
          <ModuleDialogTitle className="text-2xl font-bold">Inventory Management</ModuleDialogTitle>
          <ModuleDialogDescription>Loading...</ModuleDialogDescription>
        </ModuleDialogHeader>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleDialogHeader>
        <ModuleDialogTitle className="text-2xl font-bold">Inventory Management</ModuleDialogTitle>
        <ModuleDialogDescription>
          I-manage ang mga produkto sa inyong tindahan
        </ModuleDialogDescription>
      </ModuleDialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">Tignan ang Inventory</TabsTrigger>
          <TabsTrigger value="low-stock">Kulang na Stock</TabsTrigger>
          <TabsTrigger value="manage">I-manage</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lahat ng Produkto ({products.length})</h3>
            <Button onClick={() => setShowAddProduct(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Magdagdag ng Produkto
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.product_name}</CardTitle>
                      <CardDescription>
                        {product.product_type} {product.product_size && `• ${product.product_size}`}
                      </CardDescription>
                    </div>
                    {product.stock < 10 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Maubos na
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Stock:</span>
                    <span className={product.stock < 10 ? 'text-red-600 font-semibold' : 'font-semibold'}>
                      {product.stock} pcs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Presyo:</span>
                    <span className="font-semibold">₱{product.selling_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kita per piece:</span>
                    <span className="text-green-600 font-semibold">₱{product.tubo}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, -1)}
                        disabled={product.stock === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[3ch] text-center">
                        {product.stock}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStockUpdate(product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <h3 className="text-lg font-semibold text-yellow-600">
            Produktong Maubos Na ({lowStockProducts.length})
          </h3>
          
          {lowStockProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">Sapat pa ang lahat!</h3>
              <p className="text-muted-foreground">Walang produktong maubos na sa ngayon.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <Card key={product.id} className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">
                          {product.product_name}
                        </h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {product.stock} na lang natira!
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStockUpdate(product.id, 10)}
                          className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                        >
                          +10
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStockUpdate(product.id, 50)}
                          className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                        >
                          +50
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4" />
            <p>I-manage ang inventory dito - restock, edit, delete</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Magdagdag ng Bagong Produkto</DialogTitle>
            <DialogDescription>
              Punan ang mga detalye ng produkto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Pangalan ng Produkto</Label>
              <Input
                id="product-name"
                value={newProduct.product_name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="e.g. Marlboro Red"
              />
            </div>
            <div>
              <Label htmlFor="product-type">Uri ng Produkto</Label>
              <Select value={newProduct.product_type} onValueChange={(value) => setNewProduct(prev => ({ ...prev, product_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cigarette">Sigarilyo</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Drinks">Inumin</SelectItem>
                  <SelectItem value="Instant Noodles">Instant Noodles</SelectItem>
                  <SelectItem value="Sachets">Sachet</SelectItem>
                  <SelectItem value="Other">Iba pa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product-size">Timbang (optional)</Label>
              <Input
                id="product-size"
                value={newProduct.product_size}
                onChange={(e) => setNewProduct(prev => ({ ...prev, product_size: e.target.value }))}
                placeholder="e.g. 20g, 132g"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial-stock">Unang Stock</Label>
                <Input
                  id="initial-stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="selling-price">Presyo</Label>
                <Input
                  id="selling-price"
                  type="number"
                  value={newProduct.selling_price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="puhunan">Puhunan (per pc)</Label>
                <Input
                  id="puhunan"
                  type="number"
                  value={newProduct.puhunan_each}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, puhunan_each: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="tubo">Kita (per pc)</Label>
                <Input
                  id="tubo"
                  type="number"
                  value={newProduct.tubo}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, tubo: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddProduct(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Idagdag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
