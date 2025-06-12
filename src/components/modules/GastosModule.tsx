import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Receipt, Calendar, Download, Trash2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GastosModuleProps {
  onClose: () => void;
}

export const GastosModule = ({ onClose }: GastosModuleProps) => {
  const { expenses, addExpense, deleteExpense, loading } = useExpenses();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('add');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    'Puhunan', 'Load Credits', 'Transportation', 'Utilities', 
    'Rent', 'Food & Beverages', 'Office Supplies', 'Marketing', 
    'Repairs & Maintenance', 'Others'
  ];

  const handleAddExpense = async () => {
    if (!category || !amount || amount <= 0) {
      toast({
        title: "Kulang ang datos!",
        description: "I-fill ang category at amount.",
        variant: "destructive"
      });
      return;
    }

    const result = await addExpense(category, amount, description || undefined);

    if (result.success) {
      setCategory('');
      setAmount(0);
      setDescription('');
      toast({
        title: "Gastos naidagdag!",
        description: `₱${amount} gastos sa ${category} ay naitala na.`
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const result = await deleteExpense(expenseId);
    if (result.success) {
      toast({
        title: "Gastos na-delete!",
        description: "Na-delete na ang gastos record."
      });
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getTodaysExpenses = () => {
    const today = new Date().toDateString();
    return expenses
      .filter(expense => new Date(expense.created_at).toDateString() === today)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        new Date(expense.created_at).toLocaleDateString(),
        expense.category,
        expense.amount,
        expense.description || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `gastos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-red-600" />
          Gastos (Expense Tracking)
        </DialogTitle>
        <DialogDescription>
          I-track ang lahat ng business expenses
        </DialogDescription>
      </DialogHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-red-50 dark:bg-red-950 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Today</p>
                <p className="text-2xl font-bold text-red-600">₱{getTodaysExpenses().toLocaleString()}</p>
              </div>
              <Receipt className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{expenses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(getExpensesByCategory()).length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">Add Gastos</TabsTrigger>
          <TabsTrigger value="manage">I-manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Piliin ang category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="I-enter ang amount"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I-describe ang gastos (optional)"
              rows={3}
            />
          </div>

          <Button onClick={handleAddExpense} className="w-full bg-red-500 hover:bg-red-600">
            <Receipt className="h-4 w-4 mr-2" />
            Record Gastos
          </Button>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* Search and Filter - REMOVED DUPLICATE EXPORT BUTTON */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expenses List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-red-600">₱{expense.amount.toLocaleString()}</div>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4" />
                <p>No expenses found</p>
                <p className="text-sm">Add your first expense to start tracking</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(getExpensesByCategory()).map(([category, total]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <span className="font-semibold text-red-600">₱{total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{expense.category}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold text-red-600">₱{expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SINGLE EXPORT BUTTON ONLY IN REPORTS TAB */}
          <div className="flex justify-center">
            <Button onClick={exportToCSV} className="bg-green-500 hover:bg-green-600">
              <Download className="h-4 w-4 mr-2" />
              Export All Records to CSV
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
