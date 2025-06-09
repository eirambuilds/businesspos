
import { useState } from 'react';
import { useInventorySnapshots } from '@/hooks/useInventorySnapshots';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, TrendingDown, TrendingUp, Minus, Eye } from 'lucide-react';
import { SnapshotDetailModal } from './SnapshotDetailModal';
import type { InventorySnapshot } from '@/hooks/useInventorySnapshots';

interface InventorySnapshotModuleProps {
  onClose: () => void;
}

export const InventorySnapshotModule = ({ onClose }: InventorySnapshotModuleProps) => {
  const { snapshots, loading, createSnapshot, compareSnapshots } = useInventorySnapshots();
  const [comparing, setComparing] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<InventorySnapshot | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleCreateSnapshot = async () => {
    await createSnapshot();
  };

  const handleViewSnapshot = (snapshot: InventorySnapshot) => {
    setSelectedSnapshot(snapshot);
    setShowDetailModal(true);
  };

  const latest = snapshots[0];
  const previous = snapshots[1];
  const comparison = latest && previous ? compareSnapshots(latest, previous) : [];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">End Inventory Today</DialogTitle>
        <DialogDescription>
          I-record ang ending inventory para sa araw na ito
        </DialogDescription>
      </DialogHeader>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Inventory Snapshots</h3>
          <p className="text-sm text-muted-foreground">{snapshots.length} snapshots recorded</p>
        </div>
        <Button onClick={handleCreateSnapshot} className="bg-blue-500 hover:bg-blue-600">
          <Calendar className="h-4 w-4 mr-2" />
          End Inventory Now
        </Button>
      </div>

      {latest && previous && (
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Latest vs Previous Comparison
            </CardTitle>
            <CardDescription>
              {new Date(latest.created_at).toLocaleDateString()} vs {new Date(previous.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => setComparing(!comparing)}
              className="mb-4"
            >
              {comparing ? 'Hide' : 'Show'} Detailed Comparison
            </Button>
            
            {comparing && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {comparison.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                    <div>
                      <span className="font-medium">{item.product_name}</span>
                      <div className="text-sm text-muted-foreground">
                        {item.previousStock} → {item.stock}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'increased' && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{item.difference}
                        </Badge>
                      )}
                      {item.status === 'decreased' && (
                        <Badge variant="destructive">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {item.difference}
                        </Badge>
                      )}
                      {item.status === 'same' && (
                        <Badge variant="secondary">
                          <Minus className="h-3 w-3 mr-1" />
                          No change
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Snapshots</h3>
        {snapshots.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Walang inventory snapshots pa. I-create ang una!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snapshot) => (
              <Card key={snapshot.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">
                        {new Date(snapshot.created_at).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {snapshot.total_items} total items in stock
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSnapshot(snapshot)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(snapshot.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SnapshotDetailModal
        snapshot={selectedSnapshot}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};
