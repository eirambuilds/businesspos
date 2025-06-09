
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, Search, Phone, MapPin } from 'lucide-react';

interface CustomerProfilesModuleProps {
  onClose: () => void;
}

export const CustomerProfilesModule = ({ onClose }: CustomerProfilesModuleProps) => {
  const { customers, loading, addCustomer, getCustomerTransactions } = useCustomers();
  const { credits } = useCredits();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;

    const result = await addCustomer(newCustomer);
    if (result.success) {
      setNewCustomer({ name: '', phone: '', address: '', notes: '' });
      setShowAddDialog(false);
    }
  };

  const handleSelectCustomer = async (customerName: string) => {
    setSelectedCustomer(customerName);
    const transactions = await getCustomerTransactions(customerName);
    setCustomerTransactions(transactions);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerCredits = (customerName: string) => {
    return credits.filter(credit => credit.customer_name === customerName);
  };

  const getCustomerBalance = (customerName: string) => {
    const customerCredits = getCustomerCredits(customerName);
    return customerCredits
      .filter(credit => !credit.is_paid)
      .reduce((sum, credit) => sum + credit.amount_owed, 0);
  };

  const getCreditsByCategory = (customerName: string) => {
    const customerCredits = getCustomerCredits(customerName);
    const categories = { paninda: 0, load: 0, gcash: 0, bills: 0 };
    
    customerCredits
      .filter(credit => !credit.is_paid)
      .forEach(credit => {
        const items = Array.isArray(credit.items) ? credit.items : [];
        items.forEach((item: any) => {
          if (categories.hasOwnProperty(item.type)) {
            categories[item.type as keyof typeof categories] += item.type === 'paninda' 
              ? item.selling_price * item.quantity 
              : item.amount || 0;
          }
        });
      });
    
    return categories;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Customer Profiles</DialogTitle>
        <DialogDescription>
          I-manage ang customer information at history
        </DialogDescription>
      </DialogHeader>

      {!selectedCustomer ? (
        <>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => {
              const balance = getCustomerBalance(customer.name);
              const categories = getCreditsByCategory(customer.name);
              
              return (
                <Card 
                  key={customer.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectCustomer(customer.name)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </p>
                        )}
                        {customer.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address}
                          </p>
                        )}
                      </div>
                      {balance > 0 && (
                        <Badge variant="destructive">
                          ₱{balance.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {categories.paninda > 0 && (
                        <div>Paninda: ₱{categories.paninda.toLocaleString()}</div>
                      )}
                      {categories.load > 0 && (
                        <div>Load: ₱{categories.load.toLocaleString()}</div>
                      )}
                      {categories.gcash > 0 && (
                        <div>GCash: ₱{categories.gcash.toLocaleString()}</div>
                      )}
                      {categories.bills > 0 && (
                        <div>Bills: ₱{categories.bills.toLocaleString()}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
              ← Back to Customers
            </Button>
            <h3 className="text-xl font-semibold">{selectedCustomer}</h3>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="credits">Credits (Utang)</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ₱{getCustomerBalance(selectedCustomer).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Balance by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const categories = getCreditsByCategory(selectedCustomer);
                      return (
                        <div className="space-y-2">
                          {Object.entries(categories).map(([category, amount]) => (
                            amount > 0 && (
                              <div key={category} className="flex justify-between">
                                <span className="capitalize">{category}:</span>
                                <span className="font-semibold">₱{amount.toLocaleString()}</span>
                              </div>
                            )
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="credits" className="space-y-4">
              <div className="space-y-3">
                {getCustomerCredits(selectedCustomer).map((credit) => (
                  <Card key={credit.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant={credit.is_paid ? 'default' : 'destructive'}>
                            {credit.is_paid ? 'Paid' : 'Unpaid'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(credit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₱{credit.amount_owed.toLocaleString()}</p>
                          {credit.is_paid && credit.paid_date && (
                            <p className="text-xs text-muted-foreground">
                              Paid: {new Date(credit.paid_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {customerTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant={
                            transaction.type === 'payment' ? 'default' : 
                            transaction.type === 'sale' ? 'default' : 'destructive'
                          }>
                            {transaction.type}
                          </Badge>
                          <p className="text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₱{transaction.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              I-register ang bagong customer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Name *</Label>
              <Input
                id="customer-name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="09xxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Customer address"
              />
            </div>
            <div>
              <Label htmlFor="customer-notes">Notes</Label>
              <Input
                id="customer-notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddCustomer} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Add Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
