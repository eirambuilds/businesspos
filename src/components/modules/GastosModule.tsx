
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, Zap, Wifi, ShoppingCart, Car, Home } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';

interface GastosModuleProps {
  onClose: () => void;
}

export const GastosModule = ({ onClose }: GastosModuleProps) => {
  const { expenses, loading, addExpense, getTodaysTotal, getMonthlyTotal } = useExpenses();
  const [activeTab, setActiveTab] = useState('view');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    description: ''
  });

  const expenseCategories = [
    { value: 'Kuryente', label: 'Kuryente', icon: Zap, color: 'text-yellow-600' },
    { value: 'Internet', label: 'Internet/Phone', icon: Wifi, color: 'text-blue-600' },
    { value: 'Restock', label: 'Restock/Grocery', icon: ShoppingCart, color: 'text-green-600' },
    { value: 'Transportation', label: 'Transportation', icon: Car, color: 'text-purple-600' },
    { value: 'Store Maintenance', label: 'Store Maintenance', icon: Home, color: 'text-orange-600' },
    { value: 'Other', label: 'Iba pa', icon: Wallet, color: 'text-gray-600' }
  ];

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      return;
    }
    
    const result = await addExpense(newExpense.category, newExpense.amount, newExpense.description);
    if (result.success) {
      setNewExpense({ category: '', amount: 0, description: '' });
      setShowAddExpense(false);
    }
  };

  // Calculate totals
  const todayTotal = getTodaysTotal();
  const monthTotal = getMonthlyTotal();
  
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const todayExpenses = expenses.filter(e => e.created_at.startsWith(today));
  const thisMonthExpenses = expenses.filter(e => e.created_at.startsWith(thisMonth));

  // Category breakdown for this month
  const categoryTotals = expenseCategories.map(cat => ({
    ...cat,
    total: thisMonthExpenses
      .filter(e => e.category === cat.value)
      .reduce((total, e) => total + e.amount, 0)
  })).filter(cat => cat.total > 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Gastos (Expense Tracking)</DialogTitle>
        <DialogDescription>
          I-track ang lahat ng gastos para sa tindahan
        </DialogDescription>
      </DialogHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Ngayon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₱{todayTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{todayExpenses.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Ngayong Buwan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₱{monthTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{thisMonthExpenses.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₱{Math.round(monthTotal / new Date().getDate()).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">Mga Gastos</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="manage">I-manage</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Expenses</h3>
            <Button onClick={() => setShowAddExpense(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Gastos
            </Button>
          </div>
          
          <div className="space-y-3">
            {expenses.slice(0, 10).map((expense) => {
              const category = expenseCategories.find(c => c.value === expense.category);
              return (
                <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {category && (
                          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm">{expense.category}</h4>
                          <p className="text-xs text-muted-foreground">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(expense.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">₱{expense.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <h3 className="text-lg font-semibold">Gastos by Category (This Month)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTotals.map((category) => (
              <Card key={category.value} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{category.label}</h4>
                      <p className="text-2xl font-bold text-red-600">₱{category.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {((category.total / monthTotal) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4" />
            <p>Export reports, set budgets, expense analytics</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Magdagdag ng Gastos</DialogTitle>
            <DialogDescription>
              I-record ang bagong gastos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expense-category">Category</Label>
              <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Piliin ang category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expense-amount">Halaga</Label>
              <Input
                id="expense-amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. Meralco bill - June"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Idagdag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
