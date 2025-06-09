
import { useState } from 'react';
import { useLiabilities } from '@/hooks/useLiabilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Clock, User } from 'lucide-react';

interface LiabilitiesModuleProps {
  onClose: () => void;
}

export const LiabilitiesModule = ({ onClose }: LiabilitiesModuleProps) => {
  const { liabilities, loading, addLiability, updateLiabilityStatus } = useLiabilities();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLiability, setNewLiability] = useState({
    type: '',
    person_involved: '',
    amount: 0,
    description: '',
    status: 'unpaid' as 'paid' | 'unpaid',
    due_date: ''
  });

  const handleAddLiability = async () => {
    if (!newLiability.type || !newLiability.person_involved || !newLiability.amount) {
      return;
    }

    const result = await addLiability(newLiability);
    if (result.success) {
      setNewLiability({
        type: '',
        person_involved: '',
        amount: 0,
        description: '',
        status: 'unpaid',
        due_date: ''
      });
      setShowAddDialog(false);
    }
  };

  const liabilityTypes = [
    'Supplier Debt',
    'Store Rent',
    'Utilities',
    'Equipment Loan',
    'Personal Loan',
    'Other'
  ];

  const totalUnpaid = liabilities
    .filter(l => l.status === 'unpaid')
    .reduce((sum, l) => sum + l.amount, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Liabilities Management</DialogTitle>
        <DialogDescription>
          I-track ang lahat ng utang at obligations ng tindahan
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₱{totalUnpaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {liabilities.filter(l => l.status === 'unpaid').length} unpaid liabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₱{liabilities
                .filter(l => new Date(l.created_at).getMonth() === new Date().getMonth())
                .reduce((sum, l) => sum + l.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">New liabilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {liabilities.filter(l => 
                l.status === 'unpaid' && 
                l.due_date && 
                new Date(l.due_date) < new Date()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Items past due</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Liabilities</h3>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Liability
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {liabilities.map((liability) => (
          <Card key={liability.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={liability.status === 'paid' ? 'default' : 'destructive'}>
                      {liability.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{liability.type}</span>
                  </div>
                  <h4 className="font-semibold">{liability.person_involved}</h4>
                  <p className="text-sm text-muted-foreground">{liability.description}</p>
                  {liability.due_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(liability.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">₱{liability.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(liability.created_at).toLocaleDateString()}
                  </p>
                  {liability.status === 'unpaid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLiabilityStatus(liability.id, 'paid')}
                      className="mt-2"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Liability</DialogTitle>
            <DialogDescription>
              I-record ang bagong liability o utang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="liability-type">Type</Label>
              <Select 
                value={newLiability.type} 
                onValueChange={(value) => setNewLiability(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Piliin ang type" />
                </SelectTrigger>
                <SelectContent>
                  {liabilityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="person">Person/Company Involved</Label>
              <Input
                id="person"
                value={newLiability.person_involved}
                onChange={(e) => setNewLiability(prev => ({ ...prev, person_involved: e.target.value }))}
                placeholder="e.g. Supplier ABC"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newLiability.amount}
                onChange={(e) => setNewLiability(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newLiability.description}
                onChange={(e) => setNewLiability(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Details about this liability"
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={newLiability.due_date}
                onChange={(e) => setNewLiability(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddLiability} className="flex-1 bg-blue-500 hover:bg-blue-600">
                Add Liability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
