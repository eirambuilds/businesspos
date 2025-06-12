
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useGcash } from '@/hooks/useGcash';
import { useLoad } from '@/hooks/useLoad';
import { useBills } from '@/hooks/useBills';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Download, DollarSign, Package, Smartphone, CreditCard, FileText } from 'lucide-react';

interface KitaModuleProps {
  onClose: () => void;
}

export const KitaModule = ({ onClose }: KitaModuleProps) => {
  const { products } = useProducts();
  const { sales, getTodaysSales, getWeeklySales, getMonthlySales, getYearlySales } = useSales();
  const { transactions: gcashTransactions, getTodaysKita: getGcashTodaysKita, getWeeklyKita: getGcashWeeklyKita, getMonthlyKita: getGcashMonthlyKita, getYearlyKita: getGcashYearlyKita } = useGcash();
  const { transactions: loadTransactions, getTodaysKita: getLoadTodaysKita, getWeeklyKita: getLoadWeeklyKita, getMonthlyKita: getLoadMonthlyKita, getYearlyKita: getLoadYearlyKita } = useLoad();
  const { transactions: billsTransactions, getTodaysKita: getBillsTodaysKita, getWeeklyKita: getBillsWeeklyKita, getMonthlyKita: getBillsMonthlyKita, getYearlyKita: getBillsYearlyKita } = useBills();
  const { expenses } = useExpenses();
  
  const [activeTab, setActiveTab] = useState('ngayon');

  // Calculate profits for different periods
  const calculateProfits = (period: 'today' | 'week' | 'month' | 'year') => {
    let productsSales, gcashKita, loadKita, billsKita, periodExpenses;
    
    const now = new Date();
    
    switch (period) {
      case 'today':
        productsSales = getTodaysSales();
        gcashKita = getGcashTodaysKita();
        loadKita = getLoadTodaysKita();
        billsKita = getBillsTodaysKita();
        periodExpenses = expenses.filter(e => 
          new Date(e.created_at).toDateString() === now.toDateString()
        ).reduce((sum, e) => sum + e.amount, 0);
        break;
      case 'week':
        productsSales = getWeeklySales();
        gcashKita = getGcashWeeklyKita();
        loadKita = getLoadWeeklyKita();
        billsKita = getBillsWeeklyKita();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        periodExpenses = expenses.filter(e => 
          new Date(e.created_at) >= weekStart
        ).reduce((sum, e) => sum + e.amount, 0);
        break;
      case 'month':
        productsSales = getMonthlySales();
        gcashKita = getGcashMonthlyKita();
        loadKita = getLoadMonthlyKita();
        billsKita = getBillsMonthlyKita();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodExpenses = expenses.filter(e => 
          new Date(e.created_at) >= monthStart
        ).reduce((sum, e) => sum + e.amount, 0);
        break;
      case 'year':
        productsSales = getYearlySales();
        gcashKita = getGcashYearlyKita();
        loadKita = getLoadYearlyKita();
        billsKita = getBillsYearlyKita();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        periodExpenses = expenses.filter(e => 
          new Date(e.created_at) >= yearStart
        ).reduce((sum, e) => sum + e.amount, 0);
        break;
    }

    // Estimate product profit (20% margin)
    const productsKita = productsSales * 0.2;
    
    const grossProfit = productsKita + gcashKita + loadKita + billsKita;
    const netProfit = grossProfit - periodExpenses;

    return {
      products: { sales: productsSales, kita: productsKita },
      gcash: { kita: gcashKita },
      load: { kita: loadKita },
      bills: { kita: billsKita },
      grossProfit,
      expenses: periodExpenses,
      netProfit
    };
  };

  const exportData = (period: string) => {
    const data = calculateProfits(period as any);
    const csvContent = [
      ['Category', 'Sales', 'Profit'],
      ['Products', data.products.sales, data.products.kita],
      ['GCash', '', data.gcash.kita],
      ['Load', '', data.load.kita],
      ['Bills', '', data.bills.kita],
      ['', '', ''],
      ['Gross Profit', '', data.grossProfit],
      ['Expenses', '', data.expenses],
      ['Net Profit', '', data.netProfit]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `kita-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderProfitCard = (period: 'today' | 'week' | 'month' | 'year') => {
    const data = calculateProfits(period);
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-600">₱{data.grossProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold text-red-600">₱{data.expenses.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">₱{data.netProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Package className="h-4 w-4 mr-2 text-purple-600" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold">₱{data.products.sales.toLocaleString()}</div>
                <div className="text-sm text-purple-600">Kita: ₱{data.products.kita.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                GCash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-blue-600">₱{data.gcash.kita.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Profit only</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-600">₱{data.load.kita.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Profit only</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2 text-orange-600" />
                Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-orange-600">₱{data.bills.kita.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Profit only</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <Button onClick={() => exportData(period)} className="bg-green-500 hover:bg-green-600">
            <Download className="h-4 w-4 mr-2" />
            Export {period.charAt(0).toUpperCase() + period.slice(1)} Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Kita (Profit Tracking)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ngayon">Ngayon (Today)</TabsTrigger>
              <TabsTrigger value="linggo">Linggo (Week)</TabsTrigger>
              <TabsTrigger value="buwan">Buwan (Month)</TabsTrigger>
              <TabsTrigger value="taon">Taon (Year)</TabsTrigger>
            </TabsList>

            <TabsContent value="ngayon" className="mt-6">
              {renderProfitCard('today')}
            </TabsContent>

            <TabsContent value="linggo" className="mt-6">
              {renderProfitCard('week')}
            </TabsContent>

            <TabsContent value="buwan" className="mt-6">
              {renderProfitCard('month')}
            </TabsContent>

            <TabsContent value="taon" className="mt-6">
              {renderProfitCard('year')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
