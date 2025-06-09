
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calculator } from 'lucide-react';
import type { InventorySnapshot } from '@/hooks/useInventorySnapshots';

interface SnapshotDetailModalProps {
  snapshot: InventorySnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SnapshotDetailModal = ({ snapshot, isOpen, onClose }: SnapshotDetailModalProps) => {
  if (!snapshot) return null;

  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const totalValue = items.reduce((sum, item) => sum + (item.selling_price * item.stock), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.puhunan_each * item.stock), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Snapshot Details
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {new Date(snapshot.created_at).toLocaleString()} • {snapshot.total_items} total items
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {snapshot.total_items}
                </div>
                <p className="text-xs text-muted-foreground">pieces in stock</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₱{totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">selling price value</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₱{totalCost.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">capital invested</p>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Detailed Item List ({items.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-6 gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium">
                  <div>Product Name</div>
                  <div className="text-center">Stock</div>
                  <div className="text-center">Unit Cost</div>
                  <div className="text-center">Unit Price</div>
                  <div className="text-center">Total Cost</div>
                  <div className="text-center">Total Value</div>
                </div>

                {items.map((item, index) => {
                  const itemTotalCost = item.puhunan_each * item.stock;
                  const itemTotalValue = item.selling_price * item.stock;
                  
                  return (
                    <div key={index} className="grid grid-cols-6 gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm">
                      <div className="font-medium">
                        {item.product_name}
                        {item.product_size && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.product_size})
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <Badge variant={item.stock > 0 ? 'default' : 'destructive'}>
                          {item.stock}
                        </Badge>
                      </div>
                      <div className="text-center">₱{item.puhunan_each.toFixed(2)}</div>
                      <div className="text-center">₱{item.selling_price.toFixed(2)}</div>
                      <div className="text-center font-medium">₱{itemTotalCost.toFixed(2)}</div>
                      <div className="text-center font-medium text-green-600">₱{itemTotalValue.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-6 gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded font-bold">
                  <div>TOTALS:</div>
                  <div className="text-center">{snapshot.total_items}</div>
                  <div className="text-center">-</div>
                  <div className="text-center">-</div>
                  <div className="text-center">₱{totalCost.toLocaleString()}</div>
                  <div className="text-center text-green-600">₱{totalValue.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
