
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Minus } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';

interface BillsQuickModuleProps {
  onClose: () => void;
}

export const BillsQuickModule = ({ onClose }: BillsQuickModuleProps) => {
  const { addBillPayment } = useBills();
  const { toast } = useToast();
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState(0);
  const [showOtherAmount, setShowOtherAmount] = useState(false);

  const billTypes = ['Meralco', 'Manila Water', 'Globe', 'PLDT', 'Sky', 'Converge', 'SSS', 'PhilHealth', 'Pag-IBIG'];
  const commonAmounts = [100, 200, 300, 500, 1000, 1500, 2000, 2500, 3000, 5000];

  const calculateCommission = (billAmount: number): number => {
    if (billAmount < 5) return 0;
    return billAmount <= 1000 ? Math.ceil(Math.max(billAmount, 500) / 500) * 10 : 20 + Math.floor((billAmount - 1000) / 500) * 10;
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const adjustAmount = (increment: number) => {
    const newAmount = Math.max(5, amount + increment);
    setAmount(newAmount);
  };

  const handleSubmit = async () => {
    if (!billType || amount < 5) {
      toast({
        title: "Kulang ang datos!",
        description: "Piliin ang bill type at amount na hindi bababa sa ₱5.",
        variant: "destructive"
      });
      return;
    }

    const result = await addBillPayment(billType, amount);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2 text-orange-600" />
          Bills Payment Quick Button
        </DialogTitle>
        <DialogDescription>
          Mag-record ng bills payment
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="bill-type">Bill Type</Label>
          <Select value={billType} onValueChange={setBillType}>
            <SelectTrigger>
              <SelectValue placeholder="Piliin ang bill type" />
            </SelectTrigger>
            <SelectContent>
              {billTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Amount</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {commonAmounts.map((commonAmount) => (
              <Button
                key={commonAmount}
                variant={amount === commonAmount ? "default" : "outline"}
                onClick={() => handleAmountChange(commonAmount)}
                className="h-12"
              >
                ₱{commonAmount}
              </Button>
            ))}
          </div>
          
          <div className="mt-4">
            <Button
              variant={showOtherAmount ? "default" : "outline"}
              onClick={() => setShowOtherAmount(!showOtherAmount)}
              className="w-full"
            >
              Other Amount
            </Button>
            
            {showOtherAmount && (
              <div className="mt-2 flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(-50)}
                  disabled={amount <= 5}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={5}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(50)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {amount > 0 && (
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Commission:</span>
                <span className="text-lg font-bold text-orange-600">
                  ₱{calculateCommission(amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600">
            Record Bills Payment
          </Button>
        </div>
      </div>
    </div>
  );
};
