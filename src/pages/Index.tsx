import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, CreditCard, FileText, DollarSign, TrendingUp, AlertTriangle, Calendar, Activity, Banknote, UserCheck, ListTodo, Download } from 'lucide-react';
import { InventoryModule } from '@/components/modules/InventoryModule';
import { SalesModule } from '@/components/modules/SalesModule';
import { LoadQuickModule } from '@/components/modules/LoadQuickModule';
import { GcashQuickModule } from '@/components/modules/GcashQuickModule';
import { BillsQuickModule } from '@/components/modules/BillsQuickModule';
import { EnhancedGroceryListModule } from '@/components/modules/EnhancedGroceryListModule';
import { SimpleGroceryListModule } from '@/components/modules/SimpleGroceryListModule';
import { GastosModule } from '@/components/modules/GastosModule';
import { KitaModule } from '@/components/modules/KitaModule';
import { UtangModule } from '@/components/modules/UtangModule';
import { InventorySnapshotModule } from '@/components/modules/InventorySnapshotModule';
import { ActivityLogModule } from '@/components/modules/ActivityLogModule';
import { LiabilitiesModule } from '@/components/modules/LiabilitiesModule';
import { CustomerProfilesModule } from '@/components/modules/CustomerProfilesModule';

const Index = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const openModule = (module: string) => {
    setActiveModule(module);
  };

  const closeModule = () => {
    setActiveModule(null);
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'inventory': return <InventoryModule onClose={closeModule} />;
      case 'sales': return <SalesModule onClose={closeModule} />;
      case 'load': return <LoadQuickModule onClose={closeModule} />;
      case 'gcash': return <GcashQuickModule onClose={closeModule} />;
      case 'bills': return <BillsQuickModule onClose={closeModule} />;
      case 'enhanced-grocery': return <EnhancedGroceryListModule onClose={closeModule} />;
      case 'simple-grocery': return <SimpleGroceryListModule onClose={closeModule} />;
      case 'gastos': return <GastosModule onClose={closeModule} />;
      case 'kita': return <KitaModule onClose={closeModule} />;
      case 'utang': return <UtangModule onClose={closeModule} />;
      case 'inventory-snapshot': return <InventorySnapshotModule onClose={closeModule} />;
      case 'activity-log': return <ActivityLogModule onClose={closeModule} />;
      case 'liabilities': return <LiabilitiesModule onClose={closeModule} />;
      case 'customer-profiles': return <CustomerProfilesModule onClose={closeModule} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            POS System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ang iyong all-in-one na solusyon para sa pamamahala ng benta, customer, at pananalapi.
          </p>
        </div>

        <div className="space-y-8">
          {/* Core Sales and Transactions */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Core Sales and Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('sales')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-6 w-6 text-blue-500" />
                    <CardTitle>Add to Cart</CardTitle>
                  </div>
                  <CardDescription>Mag-record ng mga benta</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('load')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-6 w-6 text-purple-500" />
                    <CardTitle>Load</CardTitle>
                  </div>
                  <CardDescription>Mobile load transactions</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('gcash')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-6 w-6 text-blue-600" />
                    <CardTitle>GCash</CardTitle>
                  </div>
                  <CardDescription>GCash cash-in/out services</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('bills')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-orange-500" />
                    <CardTitle>Bills</CardTitle>
                  </div>
                  <CardDescription>Utility bills payment</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Customer Management */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Customer Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('utang')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-red-500" />
                    <CardTitle>Customer (Utang)</CardTitle>
                  </div>
                  <CardDescription>I-track ang mga utang</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('customer-profiles')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-6 w-6 text-indigo-500" />
                    <CardTitle>Customer Profiles</CardTitle>
                  </div>
                  <CardDescription>Customer info at history</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Financial Tracking */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Financial Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('kita')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <CardTitle>Kita</CardTitle>
                  </div>
                  <CardDescription>I-track ang mga kita</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('gastos')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-6 w-6 text-red-600" />
                    <CardTitle>Gastos</CardTitle>
                  </div>
                  <CardDescription>I-record ang mga gastos</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('liabilities')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <CardTitle>Liabilities</CardTitle>
                  </div>
                  <CardDescription>Mga utang at obligations</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Inventory Management */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Inventory Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('inventory')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-green-500" />
                    <CardTitle>Inventory</CardTitle>
                  </div>
                  <CardDescription>I-manage ang mga produkto</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('inventory-snapshot')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-blue-700" />
                    <CardTitle>End Inventory</CardTitle>
                  </div>
                  <CardDescription>Monthly inventory snapshots</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Grocery List Management */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Grocery List Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('simple-grocery')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Download className="h-6 w-6 text-gray-500" />
                    <CardTitle>Simple Grocery List</CardTitle>
                  </div>
                  <CardDescription>Clean printable list</CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('enhanced-grocery')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-6 w-6 text-emerald-500" />
                    <CardTitle>Enhanced Grocery List</CardTitle>
                  </div>
                  <CardDescription>With cost estimates</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* System Management and Audit */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">System Management and Audit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openModule('activity-log')}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-6 w-6 text-gray-600" />
                    <CardTitle>Full System Activity Log</CardTitle>
                  </div>
                  <CardDescription>Complete audit trail</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!activeModule} onOpenChange={closeModule}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            {renderModule()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;