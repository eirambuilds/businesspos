
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useGcash } from '@/hooks/useGcash';
import { useLoad } from '@/hooks/useLoad';
import { useBills } from '@/hooks/useBills';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Smartphone, 
  CreditCard, 
  FileText, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Camera, 
  ListTodo,
  LogOut,
  Calendar,
  DollarSign,
  Receipt,
  Target
} from 'lucide-react';
import { SalesModule } from '@/components/modules/SalesModule';
import { LoadQuickModule } from '@/components/modules/LoadQuickModule';
import { GcashQuickModule } from '@/components/modules/GcashQuickModule';
import { BillsQuickModule } from '@/components/modules/BillsQuickModule';
import { InventoryModule } from '@/components/modules/InventoryModule';
import { UtangModule } from '@/components/modules/UtangModule';
import { LiabilitiesModule } from '@/components/modules/LiabilitiesModule';
import { InventorySnapshotModule } from '@/components/modules/InventorySnapshotModule';
import { EnhancedGroceryListModule } from '@/components/modules/EnhancedGroceryListModule';
import { SimpleGroceryListModule } from '@/components/modules/SimpleGroceryListModule';
import { ActivityLogModule } from '@/components/modules/ActivityLogModule';
import { KitaModule } from '@/components/modules/KitaModule';
import { GastosModule } from '@/components/modules/GastosModule';
import { UtangManageModule } from '@/components/modules/UtangManageModule';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { products } = useProducts();
  const { getTodaysSales } = useSales();
  const { getTodaysKita: getGcashKita, getTodaysGcashSales } = useGcash();
  const { getTodaysKita: getLoadKita, getTodaysLoadSales } = useLoad();
  const { getTodaysKita: getBillsKita, getTodaysBillsSales } = useBills();
  const { getTotalUnpaid } = useCredits();
  const { toast } = useToast();
  
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!"
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const openModule = (module: string) => {
    setActiveModule(module);
  };

  const closeModule = () => {
    setActiveModule(null);
  };

  // Calculate metrics
  const salesToday = getTodaysSales();
  const gcashSales = getTodaysGcashSales();
  const loadSales = getTodaysLoadSales();
  const billsSales = getTodaysBillsSales();
  const revenueToday = salesToday + gcashSales + loadSales + billsSales;
  
  const grossProfit = getGcashKita() + getLoadKita() + getBillsKita() + (salesToday * 0.2); // Estimate 20% margin on products
  
  const lowStockProducts = products.filter(p => p.stock < 10);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.selling_price * p.stock), 0);

  const renderModule = () => {
    switch (activeModule) {
      case 'sales': return <SalesModule onClose={closeModule} />;
      case 'load': return <LoadQuickModule onClose={closeModule} />;
      case 'gcash': return <GcashQuickModule onClose={closeModule} />;
      case 'bills': return <BillsQuickModule onClose={closeModule} />;
      case 'inventory': return <InventoryModule onClose={closeModule} />;
      case 'utang': return <UtangModule onClose={closeModule} />;
      case 'liabilities': return <LiabilitiesModule onClose={closeModule} />;
      case 'snapshot': return <InventorySnapshotModule onClose={closeModule} />;
      case 'grocery': return <EnhancedGroceryListModule onClose={closeModule} />;
      case 'simple-grocery': return <SimpleGroceryListModule onClose={closeModule} />;
      case 'activity': return <ActivityLogModule onClose={closeModule} />;
      case 'gastos': return <GastosModule onClose={closeModule} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 elderly-friendly">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Store Management System
            </h1>
            <p className="text-xl text-muted-foreground">Welcome back! Manage your store efficiently.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center space-x-3 h-14 px-6 text-lg"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 h-16 text-lg">
            <TabsTrigger value="overview" className="text-lg py-4">Overview</TabsTrigger>
            <TabsTrigger value="services" className="text-lg py-4">Services</TabsTrigger>
            <TabsTrigger value="customers" className="text-lg py-4">Customers</TabsTrigger>
            <TabsTrigger value="inventory" className="text-lg py-4">Inventory</TabsTrigger>
            <TabsTrigger value="finance" className="text-lg py-4">Finance</TabsTrigger>
            <TabsTrigger value="kita" className="text-lg py-4">Profit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-lg mb-2">Revenue Today</p>
                      <p className="text-4xl font-bold">₱{revenueToday.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-lg mb-2">Sales Today</p>
                      <p className="text-4xl font-bold">₱{salesToday.toLocaleString()}</p>
                    </div>
                    <Receipt className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-lg mb-2">Gross Profit Today</p>
                      <p className="text-4xl font-bold">₱{grossProfit.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-2">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-lg mb-2">Customer Credits</p>
                      <p className="text-4xl font-bold">₱{getTotalUnpaid().toLocaleString()}</p>
                    </div>
                    <Users className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => openModule('sales')}
                className="h-32 bg-blue-500 hover:bg-blue-600 flex flex-col items-center justify-center space-y-3 text-xl"
              >
                <ShoppingCart className="h-10 w-10" />
                <span>Benta</span>
              </Button>

              <Button
                onClick={() => openModule('inventory')}
                className="h-32 bg-purple-500 hover:bg-purple-600 flex flex-col items-center justify-center space-y-3 text-xl"
              >
                <Package className="h-10 w-10" />
                <span>Quick Inventory</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="kita" className="space-y-8">
            <KitaModule onClose={() => {}} />
          </TabsContent>

          <TabsContent value="services" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Smartphone className="h-7 w-7 mr-3 text-green-600" />
                    Load Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">₱{loadSales.toLocaleString()}</div>
                    <div className="text-lg text-green-600">Kita: ₱{getLoadKita().toLocaleString()}</div>
                    <Button 
                      onClick={() => openModule('load')}
                      size="lg" 
                      className="w-full bg-green-500 hover:bg-green-600 h-14 text-lg"
                    >
                      Record Load
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="h-7 w-7 mr-3 text-blue-600" />
                    GCash Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">₱{gcashSales.toLocaleString()}</div>
                    <div className="text-lg text-blue-600">Kita: ₱{getGcashKita().toLocaleString()}</div>
                    <Button 
                      onClick={() => openModule('gcash')}
                      size="lg" 
                      className="w-full bg-blue-500 hover:bg-blue-600 h-14 text-lg"
                    >
                      Record GCash
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="h-7 w-7 mr-3 text-purple-600" />
                    Bills Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">₱{billsSales.toLocaleString()}</div>
                    <div className="text-lg text-purple-600">Kita: ₱{getBillsKita().toLocaleString()}</div>
                    <Button 
                      onClick={() => openModule('bills')}
                      size="lg" 
                      className="w-full bg-purple-500 hover:bg-purple-600 h-14 text-lg"
                    >
                      Record Bills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Card className="flex-1 border-2">
                <CardHeader>
                  <div className="flex items-center justify-between w-full mb-6">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <CreditCard className="h-7 w-7 mr-3 text-orange-600" />
                        Manage Customer Credits
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">View and manage all customer utang records</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">₱{getTotalUnpaid().toLocaleString()}</div>
                      <p className="text-lg text-muted-foreground">Total unpaid credits</p>
                    </div>
                  </div>
                    <UtangManageModule onClose={() => {}} />
                </CardHeader>
                <CardContent>
                </CardContent>
              </Card>
              
              <Card className="h-auto md:h-full flex flex-col justify-between border-2 md:w-96">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="h-7 w-7 mr-3 text-blue-600" />
                    Record New Credit
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">Add new utang transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('utang')} className="w-full bg-blue-500 hover:bg-blue-600 h-14 text-lg">
                    Record Customer Credit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <CardTitle className="flex items-center text-xl">
                        <Package className="h-7 w-7 mr-3" />
                        Manage Products
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">Add, edit, and restock products</CardDescription>
                    </div>
                    <div className="ml-4">
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-lg text-muted-foreground">{products.length} total products</div>
                        {lowStockProducts.length > 0 && (
                          <Badge variant="destructive" className="text-base px-3 py-1">{lowStockProducts.length} low stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => openModule('inventory')} className="w-full h-14 text-lg">
                      Manage Inventory
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Camera className="h-7 w-7 mr-3" />
                    Ending Inventory
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">Take inventory snapshots</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('snapshot')} className="w-full h-14 text-lg">
                    Take Snapshot
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="h-7 w-7 mr-3" />
                    Simple Grocery List
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">Clean printable list</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('simple-grocery')} className="w-full h-14 text-lg">
                    Download Clean List
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <ListTodo className="h-7 w-7 mr-3" />
                    Enhanced Grocery List
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">Smart restock with cost estimates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('grocery')} className="w-full h-14 text-lg">
                    Generate List
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Receipt className="h-7 w-7 mr-3 text-red-600" />
                    Expenses (Gastos)
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">Track business expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('gastos')} className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg">
                    Manage Expenses
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <AlertTriangle className="h-7 w-7 mr-3 text-orange-600" />
                    Liabilities
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">What you owe to others</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openModule('liabilities')} className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-lg">
                    View Liabilities
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Dialog */}
        <Dialog open={!!activeModule} onOpenChange={closeModule}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-8">
            {renderModule()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
