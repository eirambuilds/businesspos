
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, User, CheckCircle, AlertCircle, ShoppingCart, Smartphone, CreditCard, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { useProducts } from '@/hooks/useProducts';

interface UtangModuleProps {
  onClose: () => void;
}

export const UtangModule = ({ onClose }: UtangModuleProps) => {
  const { toast } = useToast();
  const { credits, addCredit, markAsPaid, getTotalUnpaid, fetchCredits } = useCredits();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState('view');
  const [showAddUtang, setShowAddUtang] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  
  // Mock customers for now
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Maria Santos' },
    { id: '2', name: 'Juan dela Cruz' },
    { id: '3', name: 'Ana Reyes' }
  ]);

  const [newCustomer, setNewCustomer] = useState('');
  const [newUtang, setNewUtang] = useState({
    customerId: '',
    customerName: '',
    type: '', // 'paninda', 'load', 'gcash', 'bills'
    items: [] as any[],
    totalAmount: 0
  });

  // Cart for different types of utang
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchCredits();
  }, []);

  const addCustomer = () => {
    if (!newCustomer.trim()) return;
    
    const customer = {
      id: Date.now().toString(),
      name: newCustomer
    };
    
    setCustomers(prev => [...prev, customer]);
    setNewCustomer('');
    setShowAddCustomer(false);
    
    toast({
      title: "Customer nadagdag!",
      description: `${customer.name} ay naidagdag na sa lista.`,
    });
  };

  const addToCart = (item: any, type: string) => {
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.type === type
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart(prev => [...prev, { ...item, type, quantity: 1 }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      switch (item.type) {
        case 'paninda':
          return total + (item.selling_price * item.quantity);
        case 'load':
          return total + item.amount;
        case 'gcash':
          return total + item.amount;
        case 'bills':
          return total + item.amount;
        default:
          return total;
      }
    }, 0);
  };

  const handleAddUtang = async () => {
    if (!newUtang.customerId || cart.length === 0) {
      toast({
        title: "Kulang ang datos!",
        description: "Piliin ang customer at magdagdag ng items sa cart.",
        variant: "destructive"
      });
      return;
    }

    const customer = customers.find(c => c.id === newUtang.customerId);
    if (!customer) return;

    const totalAmount = calculateCartTotal();
    
    const result = await addCredit(customer.name, cart, totalAmount);
    if (result.success) {
      setNewUtang({ customerId: '', customerName: '', type: '', items: [], totalAmount: 0 });
      setCart([]);
      setShowAddUtang(false);
      setActiveTab('view');
    }
  };

  const handleMarkAsPaid = async (creditId: string) => {
    const result = await markAsPaid(creditId);
    if (result.success) {
      // Refresh the credits data
      fetchCredits();
    }
  };

  const unpaidCredits = credits.filter(credit => !credit.is_paid);
  const totalUnpaidAmount = getTotalUnpaid();

  const getCustomersWithUnpaidCredits = () => {
    const customerCredits = new Map();
    
    unpaidCredits.forEach(credit => {
      const existing = customerCredits.get(credit.customer_name) || {
        name: credit.customer_name,
        totalAmount: 0,
        credits: []
      };
      
      existing.totalAmount += credit.amount_owed;
      existing.credits.push(credit);
      customerCredits.set(credit.customer_name, existing);
    });
    
    return Array.from(customerCredits.values());
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Customer Credits (Utang)</DialogTitle>
        <DialogDescription>
          I-track ang mga utang ng mga customer
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Utang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₱{totalUnpaidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Hindi pa bayad</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">May Utang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{getCustomersWithUnpaidCredits().length}</div>
            <p className="text-xs text-muted-foreground">Customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hindi pa Bayad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unpaidCredits.length}</div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">Mga Customer</TabsTrigger>
          <TabsTrigger value="records">Lahat ng Utang</TabsTrigger>
          <TabsTrigger value="manage">I-manage</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mga Customer na May Utang</h3>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddCustomer(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
              <Button onClick={() => setShowAddUtang(true)} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Utang
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getCustomersWithUnpaidCredits().map((customer, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription>
                        {customer.credits.length} unpaid transaction{customer.credits.length > 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">
                      ₱{customer.totalAmount.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customer.credits.slice(0, 2).map((credit) => (
                      <div key={credit.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">₱{credit.amount_owed}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleMarkAsPaid(credit.id)}
                            className="h-6 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(credit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <h3 className="text-lg font-semibold">Lahat ng Utang Records</h3>
          
          <div className="space-y-3">
            {credits.map((credit) => (
              <Card key={credit.id} className={credit.is_paid ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'border-red-200'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{credit.customer_name}</h4>
                        <Badge variant={credit.is_paid ? "default" : "destructive"}>
                          {credit.is_paid ? "Bayad na" : "Hindi pa bayad"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(credit.created_at).toLocaleDateString()} 
                        {credit.is_paid && credit.paid_date && ` • Nabayad: ${new Date(credit.paid_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₱{credit.amount_owed}</p>
                      {!credit.is_paid && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAsPaid(credit.id)}
                          className="mt-2 border-green-500 text-green-600 hover:bg-green-50"
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>Manage utang records, send reminders, generate reports</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Magdagdag ng Customer</DialogTitle>
            <DialogDescription>
              Pangalan ng bagong customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Pangalan</Label>
              <Input
                id="customer-name"
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                placeholder="e.g. Maria Santos"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addCustomer} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Idagdag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Utang Dialog */}
      <Dialog open={showAddUtang} onOpenChange={setShowAddUtang}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Magdagdag ng Utang</DialogTitle>
            <DialogDescription>
              I-record ang bagong utang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-select">Customer</Label>
              <Select 
                value={newUtang.customerId} 
                onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setNewUtang(prev => ({ 
                    ...prev, 
                    customerId: value,
                    customerName: customer?.name || ''
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Piliin ang customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={newUtang.type} onValueChange={(value) => setNewUtang(prev => ({ ...prev, type: value }))}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="paninda">Paninda</TabsTrigger>
                <TabsTrigger value="load">Load</TabsTrigger>
                <TabsTrigger value="gcash">GCash</TabsTrigger>
                <TabsTrigger value="bills">Bills</TabsTrigger>
              </TabsList>

              <TabsContent value="paninda" className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Mga Produkto
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {products.filter(p => p.stock > 0).map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      onClick={() => addToCart(product, 'paninda')}
                      className="h-20 flex flex-col items-center justify-center text-xs"
                    >
                      <span className="font-medium">{product.product_name}</span>
                      <span className="text-muted-foreground">₱{product.selling_price}</span>
                      <span className="text-xs">Stock: {product.stock}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="load" className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Load Options
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 20, 25, 30, 50, 100, 150, 200, 300, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => addToCart({ id: `load-${amount}`, name: `Load ₱${amount}`, amount }, 'load')}
                      className="h-12"
                    >
                      ₱{amount}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gcash" className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  GCash Options
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 200, 500, 1000, 1500, 2000, 2500, 3000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => addToCart({ id: `gcash-${amount}`, name: `GCash ₱${amount}`, amount }, 'gcash')}
                      className="h-12"
                    >
                      ₱{amount}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bills" className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  Bills Options
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 200, 500, 1000, 1500, 2000, 2500, 3000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => addToCart({ id: `bills-${amount}`, name: `Bills ₱${amount}`, amount }, 'bills')}
                      className="h-12"
                    >
                      ₱{amount}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Cart */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <span className="font-medium">
                            {item.type === 'paninda' ? item.product_name : item.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">
                            ₱{item.type === 'paninda' ? (item.selling_price * item.quantity) : item.amount}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(index)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>₱{calculateCartTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddUtang(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddUtang} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Idagdag ang Utang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
