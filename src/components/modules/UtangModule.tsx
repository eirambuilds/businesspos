
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCredits } from '@/hooks/useCredits';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Smartphone, CreditCard, FileText, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  type: 'paninda' | 'load' | 'gcash' | 'bills';
  product_name?: string;
  product_size?: string;
  quantity?: number;
  selling_price?: number;
  stock?: number;
  network?: string;
  transaction_type?: string;
  bill_type?: string;
  amount?: number;
  subtotal: number;
}

interface UtangModuleProps {
  onClose: () => void;
}

export const UtangModule = ({ onClose }: UtangModuleProps) => {
  const { products } = useProducts();
  const { addCredit } = useCredits();
  const { customers } = useCustomers();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('paninda');
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Load states
  const [loadNetwork, setLoadNetwork] = useState('');
  const [loadAmount, setLoadAmount] = useState(0);
  
  // GCash states
  const [gcashAmount, setGcashAmount] = useState(0);
  const [gcashType, setGcashType] = useState('');
  
  // Bills states
  const [billType, setBillType] = useState('');
  const [billAmount, setBillAmount] = useState(0);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerName.toLowerCase())
  );

  const addToCart = (item: any, type: 'paninda' | 'load' | 'gcash' | 'bills') => {
    const cartItem: CartItem = {
      id: `${type}-${item.id || Date.now()}`,
      type,
      ...item,
      subtotal: item.selling_price || item.amount || 0
    };

    if (type === 'paninda') {
      const existingItem = cart.find(c => c.id === item.id && c.type === 'paninda');
      
      if (existingItem) {
        updateQuantity(existingItem.id, 1);
      } else {
        cartItem.quantity = 1;
        cartItem.subtotal = item.selling_price;
        setCart(prev => [...prev, cartItem]);
      }
    } else {
      setCart(prev => [...prev, cartItem]);
    }
  };

  const updateQuantity = (cartItemId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const product = products.find(p => p.id === item.id.replace('paninda-', ''));
        const newQuantity = Math.max(1, (item.quantity || 1) + change);
        
        if (product && newQuantity > product.stock) {
          toast({
            title: "Kulang na stock!",
            description: `May ${product.stock} na lang na ${product.product_name}.`,
            variant: "destructive"
          });
          return item;
        }
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal: (item.selling_price || 0) * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const addLoadToCart = () => {
    if (!loadNetwork || loadAmount <= 0) {
      toast({
        title: "Kulang ang datos!",
        description: "I-fill ang network at amount.",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      network: loadNetwork,
      amount: loadAmount
    }, 'load');

    setLoadNetwork('');
    setLoadAmount(0);
  };

  const addGcashToCart = () => {
    if (!gcashType || gcashAmount <= 0) {
      toast({
        title: "Kulang ang datos!",
        description: "I-fill ang transaction type at amount.",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      transaction_type: gcashType,
      amount: gcashAmount
    }, 'gcash');

    setGcashType('');
    setGcashAmount(0);
  };

  const addBillToCart = () => {
    if (!billType || billAmount <= 0) {
      toast({
        title: "Kulang ang datos!",
        description: "I-fill ang bill type at amount.",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      bill_type: billType,
      amount: billAmount
    }, 'bills');

    setBillType('');
    setBillAmount(0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleRecordUtang = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Kulang ang customer name!",
        description: "I-type ang pangalan ng customer.",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Walang laman ang cart!",
        description: "Magdagdag ng items sa cart.",
        variant: "destructive"
      });
      return;
    }

    const result = await addCredit(customerName, cart, getTotalAmount());
    if (result.success) {
      setCustomerName('');
      setCart([]);
      onClose();
    }
  };

  return (
    <div className="flex space-x-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
            Customer Credits (Utang)
          </DialogTitle>
          <DialogDescription>
            I-record ang mga utang ng customers
          </DialogDescription>
        </DialogHeader>

        {/* Customer Name Input */}
        <div>
          <Label htmlFor="customer-name">Customer Name</Label>
          <div className="relative">
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(customerName.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="I-type ang pangalan ng customer"
            />
            
            {showSuggestions && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredCustomers.slice(0, 5).map((customer) => (
                  <div
                    key={customer.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setCustomerName(customer.name);
                      setShowSuggestions(false);
                    }}
                  >
                    {customer.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="paninda">Paninda</TabsTrigger>
            <TabsTrigger value="load">Load</TabsTrigger>
            <TabsTrigger value="gcash">GCash</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="paninda" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {products.filter(p => p.stock > 0).map((product) => (
                <Card 
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => addToCart(product, 'paninda')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{product.product_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {product.stock} left
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {product.product_type} {product.product_size && `• ${product.product_size}`}
                      </span>
                      <span className="font-bold text-blue-600">₱{product.selling_price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="load" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="load-network">Network</Label>
                <Select value={loadNetwork} onValueChange={setLoadNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Piliin ang network type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Globe', 'Smart', 'Sun', 'TM', 'TNT', 'Dito'].map((network) => (
                      <SelectItem key={network} value={network}>{network}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="load-amount">Amount</Label>
                <Input
                  id="load-amount"
                  type="number"
                  value={loadAmount || ''}
                  onChange={(e) => setLoadAmount(Number(e.target.value))}
                  placeholder="I-enter ang amount"
                />
              </div>
            </div>
            <Button onClick={addLoadToCart} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Load to Cart
            </Button>
          </TabsContent>

          <TabsContent value="gcash" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gcash-type">Transaction Type</Label>
                <Select value={gcashType} onValueChange={setGcashType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Piliin ang transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Cash In', 'Cash Out', 'Send Money', 'Pay Bills'].map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gcash-amount">Amount</Label>
                <Input
                  id="gcash-amount"
                  type="number"
                  value={gcashAmount || ''}
                  onChange={(e) => setGcashAmount(Number(e.target.value))}
                  placeholder="I-enter ang amount"
                />
              </div>
            </div>
            <Button onClick={addGcashToCart} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add GCash to Cart
            </Button>
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bill-type">Bill Type</Label>
                <Select value={billType} onValueChange={setBillType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Piliin ang bill type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Meralco', 'Maynilad', 'PLDT', 'Globe', 'Smart', 'Cignal', 'SSS', 'PhilHealth'].map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bill-amount">Amount</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  value={billAmount || ''}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  placeholder="I-enter ang amount"
                />
              </div>
            </div>
            <Button onClick={addBillToCart} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Bill to Cart
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <ShoppingCart className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Cart ({cart.length})</h3>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
          {cart.map((item) => {
            const Icon = item.type === 'paninda' ? Package :
                       item.type === 'load' ? Smartphone :
                       item.type === 'gcash' ? CreditCard : FileText;
            
            return (
              <Card key={item.id} className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-semibold text-xs">
                        {item.product_name || item.network || item.transaction_type || item.bill_type}
                      </div>
                      {item.product_size && (
                        <div className="text-xs text-muted-foreground">{item.product_size}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {item.type === 'paninda' && (
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-5 w-5 p-0"
                        >
                          <Minus className="h-2 w-2" />
                        </Button>
                        <span className="text-xs w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-5 w-5 p-0"
                        >
                          <Plus className="h-2 w-2" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs font-semibold w-12 text-right">
                      ₱{item.subtotal}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="h-5 w-5 p-0 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span>Total:</span>
              <span className="text-orange-600">₱{getTotalAmount().toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setCart([])}
                className="w-full"
              >
                Clear Cart
              </Button>
              <Button 
                onClick={handleRecordUtang}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Record Utang
              </Button>
            </div>
          </div>
        )}

        {cart.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
            <p className="text-sm">Walang laman ang cart</p>
            <p className="text-xs">Magdagdag ng items</p>
          </div>
        )}
      </div>
    </div>
  );
};
