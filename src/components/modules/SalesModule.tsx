
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales, CartItem } from '@/hooks/useSales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesModuleProps {
  onClose: () => void;
}

export const SalesModule = ({ onClose }: SalesModuleProps) => {
  const { toast } = useToast();
  const { products, loading } = useProducts();
  const { processSale } = useSales();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Kulang na stock!",
          description: `May ${product.stock} na lang na ${product.product_name}.`,
          variant: "destructive"
        });
        return;
      }
      
      setCart(prev => prev.map(item => 
        item.id === productId 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.selling_price
            }
          : item
      ));
    } else {
      if (product.stock === 0) {
        toast({
          title: "Walang stock!",
          description: `Ubos na ang ${product.product_name}.`,
          variant: "destructive"
        });
        return;
      }
      
      setCart(prev => [...prev, {
        ...product,
        quantity: 1,
        subtotal: product.selling_price
      }]);
    }
    
    toast({
      title: "Naidagdag sa cart!",
      description: `${product.product_name} ay naidagdag na.`,
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        
        if (newQuantity > product.stock) {
          toast({
            title: "Kulang na stock!",
            description: `May ${product.stock} na lang na ${product.product_name}.`,
            variant: "destructive"
          });
          return item;
        }
        
        if (newQuantity === 0) {
          return null as any;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.selling_price
        };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Walang laman ang cart!",
        description: "Magdagdag muna ng produkto.",
        variant: "destructive"
      });
      return;
    }

    const result = await processSale(cart);
    if (result.success) {
      setCart([]);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(p => 
    p.stock > 0 && (
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.product_size && p.product_size.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Benta</DialogTitle>
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
        <DialogTitle className="text-2xl font-bold">Benta</DialogTitle>
        <DialogDescription>
          I-record ang mga binenta sa araw na ito
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mga Produkto ({filteredProducts.length})</h3>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Hanapin ang produkto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              const availableStock = product.stock - (cartItem?.quantity || 0);
              
              return (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => addToCart(product.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{product.product_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {availableStock} left
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {product.product_type} {product.product_size && `• ${product.product_size}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">₱{product.selling_price}</span>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cart</h3>
            {totalItems > 0 && (
              <Badge className="bg-blue-500">
                {totalItems} items
              </Badge>
            )}
          </div>
          
          <Card className="min-h-96">
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                  <p>Walang laman ang cart</p>
                  <p className="text-sm">Mag-click ng produkto para magsimula</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{item.product_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          ₱{item.selling_price} each {item.product_size && `• ${item.product_size}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2ch] text-center">
                          {item.quantity}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">₱{item.subtotal}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">₱{getTotalAmount().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCart([])}
                      className="flex-1"
                    >
                      Clear Cart
                    </Button>
                    <Button 
                      onClick={handleProcessSale}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      Process Sale
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
