
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useGcash } from '@/hooks/useGcash';
import { useLoad } from '@/hooks/useLoad';
import { useBills } from '@/hooks/useBills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Smartphone, CreditCard, FileText, Calendar } from 'lucide-react';

interface KitaModuleProps {
  onClose: () => void;
}

export const KitaModule = ({ onClose }: KitaModuleProps) => {
  const [activeTab, setActiveTab] = useState('today');
  const { products } = useProducts();
  const { getTodaysSales } = useSales();
  const { getTodaysKita: getGcashKita, transactions: gcashTransactions } = useGcash();
  const { getTodaysKita: getLoadKita, loadSales } = useLoad();
  const { getTodaysKita: getBillsKita, billPayments } = useBills();

  // Calculate different periods
  const calculatePeriodData = (period: 'today' | 'weekly' | 'monthly' | 'yearly') => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Calculate GCash kita
    const gcashKita = gcashTransactions
      .filter(t => new Date(t.created_at) >= startDate)
      .reduce((sum, t) => sum + t.kita, 0);

    // Calculate Load kita
    const loadKita = loadSales
      .filter(s => new Date(s.created_at) >= startDate)
      .reduce((sum, s) => sum + s.kita, 0);

    // Calculate Bills kita
    const billsKita = billPayments
      .filter(p => new Date(p.created_at) >= startDate)
      .reduce((sum, p) => sum + p.commission, 0);

    // For products kita, we'd need actual sales data - using estimated for now
    const productKita = getTodaysSales() * 0.2; // Assuming 20% profit margin

    return {
      total: productKita + gcashKita + loadKita + billsKita,
      products: productKita,
      gcash: gcashKita,
      load: loadKita,
      bills: billsKita
    };
  };

  const periodData = {
    today: calculatePeriodData('today'),
    weekly: calculatePeriodData('weekly'),
    monthly: calculatePeriodData('monthly'),
    yearly: calculatePeriodData('yearly')
  };

  const renderKitaCards = (period: 'today' | 'weekly' | 'monthly' | 'yearly') => {
    const data = periodData[period];
    const cards = [
      {
        title: 'Kita sa Produkto',
        amount: data.products,
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        title: 'Kita sa Load',
        amount: data.load,
        icon: Smartphone,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900'
      },
      {
        title: 'Kita sa GCash',
        amount: data.gcash,
        icon: CreditCard,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        title: 'Kita sa Bills',
        amount: data.bills,
        icon: FileText,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={`text-lg font-bold ${card.color}`}>
                    ₱{card.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'today': return 'Ngayon';
      case 'weekly': return 'Ngayong Linggo';
      case 'monthly': return 'Ngayong Buwan';
      case 'yearly': return 'Ngayong Taon';
      default: return 'Ngayon';
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Kita (Profit Tracking)</DialogTitle>
        <DialogDescription>
          Tingnan ang inyong kita sa iba't ibang serbisyo
        </DialogDescription>
      </DialogHeader>

      {/* Total Kita Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-green-500 text-white rounded-full w-fit mb-4">
            <TrendingUp className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            ₱{periodData[activeTab as keyof typeof periodData].total.toLocaleString()}
          </CardTitle>
          <CardDescription className="text-lg">
            Kabuuang Kita {getTabLabel(activeTab)}
          </CardDescription>
          <div className="mt-4">
            <Badge className="bg-green-500 text-white text-lg px-4 py-2">
              Magaling, Ma! 🎉
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Ngayon</TabsTrigger>
          <TabsTrigger value="weekly">Linggo</TabsTrigger>
          <TabsTrigger value="monthly">Buwan</TabsTrigger>
          <TabsTrigger value="yearly">Taon</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {renderKitaCards('today')}
          
          {/* Today's Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Breakdown ng Kita Ngayon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Product Sales</h4>
                    <p className="text-xs text-muted-foreground">From store inventory</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₱{periodData.today.products.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">GCash Services</h4>
                    <p className="text-xs text-muted-foreground">{gcashTransactions.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).length} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₱{periodData.today.gcash.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Load Sales</h4>
                    <p className="text-xs text-muted-foreground">{loadSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₱{periodData.today.load.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Bills Payment</h4>
                    <p className="text-xs text-muted-foreground">{billPayments.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₱{periodData.today.bills.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          {renderKitaCards('weekly')}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          {renderKitaCards('monthly')}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          {renderKitaCards('yearly')}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">Top Service</p>
            <p className="font-bold text-blue-600">
              {periodData.today.products > periodData.today.gcash && periodData.today.products > periodData.today.load && periodData.today.products > periodData.today.bills ? 'Products' :
               periodData.today.gcash > periodData.today.load && periodData.today.gcash > periodData.today.bills ? 'GCash' :
               periodData.today.load > periodData.today.bills ? 'Load' : 'Bills'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="font-bold text-green-600">₱{Math.round(periodData.monthly.total / new Date().getDate()).toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-muted-foreground">Service Income</p>
            <p className="font-bold text-purple-600">
              {Math.round(((periodData.today.gcash + periodData.today.load + periodData.today.bills) / periodData.today.total) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
