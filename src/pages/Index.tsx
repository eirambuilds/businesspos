
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useGcash } from '@/hooks/useGcash';
import { useLoad } from '@/hooks/useLoad';
import { useBills } from '@/hooks/useBills';
import { useCredits } from '@/hooks/useCredits';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryModule } from '@/components/modules/InventoryModule';
import { SalesModule } from '@/components/modules/SalesModule';
import { UtangModule } from '@/components/modules/UtangModule';
import { KitaModule } from '@/components/modules/KitaModule';
import { GastosModule } from '@/components/modules/GastosModule';
import { GroceryListModule } from '@/components/modules/GroceryListModule';
import { LoadQuickModule } from '@/components/modules/LoadQuickModule';
import { GcashQuickModule } from '@/components/modules/GcashQuickModule';
import { BillsQuickModule } from '@/components/modules/BillsQuickModule';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Package, ShoppingCart, FileText, TrendingUp, Wallet, LogOut, ListTodo, Smartphone, CreditCard, Receipt, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { products } = useProducts();
  const { sales, getTodaysSales } = useSales();
  const { getTodaysKita: getGcashKita } = useGcash();
  const { getTodaysKita: getLoadKita } = useLoad();
  const { getTodaysKita: getBillsKita } = useBills();
  const { getTotalUnpaid } = useCredits();
  const { getTodaysTotal: getTodaysExpenses, getMonthlyTotal: getMonthlyExpenses } = useExpenses();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [todaysProductKita, setTodaysProductKita] = useState(0);

  // Calculate today's product profit from actual sales
  useEffect(() => {
    const calculateTodaysProductKita = async () => {
      try {
        const today = new Date().toDateString();
        
        // Get today's sales
        const { data: todaysSales, error } = await supabase
          .from('sales')
          .select(`
            *,
            products!inner(tubo)
          `)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .lt('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString());

        if (error) {
          console.error('Error fetching today\'s sales:', error);
          return;
        }

        // Calculate total profit
        const totalKita = (todaysSales || []).reduce((sum, sale) => {
          const productTubo = sale.products?.tubo || 0;
          return sum + (productTubo * sale.quantity);
        }, 0);

        setTodaysProductKita(totalKita);
      } catch (error) {
        console.error('Error calculating product kita:', error);
      }
    };

    calculateTodaysProductKita();
  }, [sales]);

  // Calculate dashboard data dynamically
  const lowStockItems = products.filter(p => p.stock < 10).length;
  const todaysSales = getTodaysSales();
  
  // Total kita from all sources
  const gcashKita = getGcashKita();
  const loadKita = getLoadKita();
  const billsKita = getBillsKita();
  const totalKitaToday = todaysProductKita + gcashKita + loadKita + billsKita;
  const totalUnpaidCredits = getTotalUnpaid();
  const todaysExpenses = getTodaysExpenses();
  const monthlyExpenses = getMonthlyExpenses();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Na-logout na!",
      description: "Salamat sa paggamit ng sistema."
    });
  };

  const quickActions = [
    {
      title: 'Benta',
      description: 'I-record ang sales',
      icon: ShoppingCart,
      color: 'bg-green-500 hover:bg-green-600',
      module: 'sales'
    },
    {
      title: 'Load Quick',
      description: 'Mag-load ng mobile',
      icon: Smartphone,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      module: 'load-quick'
    },
    {
      title: 'GCash Quick',
      description: 'GCash transactions',
      icon: CreditCard,
      color: 'bg-blue-600 hover:bg-blue-700',
      module: 'gcash-quick'
    },
    {
      title: 'Bills Payment',
      description: 'Bayad bills',
      icon: Receipt,
      color: 'bg-orange-500 hover:bg-orange-600',
      module: 'bills-quick'
    },
    {
      title: 'Utang',
      description: 'Customer credits',
      icon: FileText,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      module: 'utang'
    },
    {
      title: 'Kita',
      description: 'Tingnan ang profit',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      module: 'kita'
    },
    {
      title: 'Gastos',
      description: 'I-track ang expenses',
      icon: Wallet,
      color: 'bg-red-500 hover:bg-red-600',
      module: 'gastos'
    },
    {
      title: 'Grocery List',
      description: 'Generate restock list',
      icon: ListTodo,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      module: 'grocery'
    },
    {
      title: 'Magdagdag ng Paninda',
      description: 'I-manage ang inventory',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600',
      module: 'inventory'
    },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'inventory':
        return <InventoryModule onClose={() => setActiveModule(null)} />;
      case 'sales':
        return <SalesModule onClose={() => setActiveModule(null)} />;
      case 'load-quick':
        return <LoadQuickModule onClose={() => setActiveModule(null)} />;
      case 'gcash-quick':
        return <GcashQuickModule onClose={() => setActiveModule(null)} />;
      case 'bills-quick':
        return <BillsQuickModule onClose={() => setActiveModule(null)} />;
      case 'utang':
        return <UtangModule onClose={() => setActiveModule(null)} />;
      case 'kita':
        return <KitaModule onClose={() => setActiveModule(null)} />;
      case 'gastos':
        return <GastosModule onClose={() => setActiveModule(null)} />;
      case 'grocery':
        return <GroceryListModule onClose={() => setActiveModule(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">POS System</h1>
              <p className="text-sm text-muted-foreground">
                Kumusta, {user?.email?.split('@')[0]}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Cards */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales Ngayon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₱{todaysSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Araw na ito</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Ngayon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{todaysExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Buwan: ₱{monthlyExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utang Hindi pa Bayad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₱{totalUnpaidCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Kita Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kita sa Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₱{todaysProductKita.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Paninda ngayon</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kita sa Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{loadKita.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Load ngayon</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kita sa GCash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₱{gcashKita.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">GCash ngayon</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kita sa Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₱{billsKita.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Bills ngayon</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kulang na Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Produkto na maubos na</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Produkto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <p className="text-xs text-muted-foreground">Sa inventory</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mabilis na Aksyon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => setActiveModule(action.module)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-700 dark:text-yellow-300">
                Babala: May kulang na stock!
              </CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-400">
                May {lowStockItems} na produkto na maubos na. I-check ang inventory.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>

      {/* Module Dialogs */}
      {activeModule && (
        <Dialog open={!!activeModule} onOpenChange={() => setActiveModule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {renderModule()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
