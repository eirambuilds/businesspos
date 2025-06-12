
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, AlertTriangle, FileDown } from 'lucide-react';

interface InventoryReportsModuleProps {
  onClose: () => void;
}

export const InventoryReportsModule = ({ onClose }: InventoryReportsModuleProps) => {
  const { products } = useProducts();
  const { sales } = useSales();

  const calculateStockValue = () => {
    return {
      sellingValue: products.reduce((sum, p) => sum + (p.selling_price * p.stock), 0),
      capitalValue: products.reduce((sum, p) => sum + (p.puhunan_each * p.stock), 0),
      totalProfit: products.reduce((sum, p) => sum + (p.tubo * p.stock), 0)
    };
  };

  const getStockLevels = () => {
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const goodStock = products.filter(p => p.stock > 10).length;
    
    return [
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
      { name: 'Low Stock', value: lowStock, color: '#f97316' },
      { name: 'Good Stock', value: goodStock, color: '#22c55e' }
    ];
  };

  const getTopProducts = () => {
    const productSales = sales.reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.product_id);
      if (product) {
        if (!acc[product.product_name]) {
          acc[product.product_name] = { quantity: 0, revenue: 0 };
        }
        acc[product.product_name].quantity += sale.quantity;
        acc[product.product_name].revenue += sale.total_amount;
      }
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const exportInventoryReport = () => {
    const stockValue = calculateStockValue();
    const date = new Date().toLocaleDateString();
    
    const reportContent = `INVENTORY REPORT - ${date}\n` +
      `${"=".repeat(50)}\n\n` +
      `SUMMARY:\n` +
      `Total Products: ${products.length}\n` +
      `Stock Value (SRP): ₱${stockValue.sellingValue.toLocaleString()}\n` +
      `Stock Value (Capital): ₱${stockValue.capitalValue.toLocaleString()}\n` +
      `Potential Profit: ₱${stockValue.totalProfit.toLocaleString()}\n\n` +
      `DETAILED INVENTORY:\n` +
      `${"=".repeat(50)}\n` +
      products.map(p => 
        `${p.product_name}\n` +
        `  Stock: ${p.stock} pcs\n` +
        `  Capital: ₱${p.puhunan_each} each\n` +
        `  SRP: ₱${p.selling_price} each\n` +
        `  Total Value: ₱${(p.selling_price * p.stock).toLocaleString()}\n`
      ).join('\n');

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${date.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockValue = calculateStockValue();
  const stockLevels = getStockLevels();
  const topProducts = getTopProducts();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stock Value (SRP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱{stockValue.sellingValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Capital Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₱{stockValue.capitalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₱{stockValue.totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stockLevels}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stockLevels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {products.filter(p => p.stock <= 10).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium text-sm">{product.product_name}</span>
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                        {product.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Based on total revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="flex justify-center">
            <Card className="w-auto max-w-md">
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Download detailed inventory reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportInventoryReport} className="w-full">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Complete Inventory Report
                </Button>
                <div className="text-sm text-muted-foreground">
                  Exports include: Product details, stock levels, values, and analysis
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
