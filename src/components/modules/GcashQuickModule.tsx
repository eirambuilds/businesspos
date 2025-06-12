
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Minus } from 'lucide-react';
import { useGcash } from '@/hooks/useGcash';
import { useToast } from '@/hooks/use-toast';

interface GcashQuickModuleProps {
  onClose: () => void;
}

export const GcashQuickModule = ({ onClose }: GcashQuickModuleProps) => {
  const { addTransaction } = useGcash();
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState(0);
  const [showOtherAmount, setShowOtherAmount] = useState(false);

  const transactionTypes = ['Cash In', 'Cash Out', 'Payment'];
  const commonAmounts = [100, 200, 300, 500, 1000, 1500, 2000, 2500, 3000, 5000];

  const calculateKita = (gcashAmount: number): number => {
    if (gcashAmount < 5) return 0;
    const tier = Math.min(Math.ceil(Math.max(gcashAmount, 500) / 500), 5);
    return gcashAmount <= 2500 ? tier * 10 : 50 + Math.floor((gcashAmount - 2500) / 500) * 10;
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const adjustAmount = (increment: number) => {
    const newAmount = Math.max(5, amount + increment);
    setAmount(newAmount);
  };

  const handleSubmit = async () => {
    if (!transactionType || amount < 5) {
      toast({
        title: "Kulang ang datos!",
        description: "Piliin ang transaction type at amount na hindi bababa sa ₱5.",
        variant: "destructive"
      });
      return;
    }

    const result = await addTransaction(amount, transactionType);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
          GCash Quick Button
        </DialogTitle>
        <DialogDescription>
          Mag-record ng GCash transaction
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="transaction-type">Transaction Type</Label>
          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger>
              <SelectValue placeholder="Piliin ang transaction type" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map((type) => (
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
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Kita:</span>
                <span className="text-lg font-bold text-blue-600">
                  ₱{calculateKita(amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-blue-500 hover:bg-blue-600">
            Record GCash Transaction
          </Button>
        </div>
      </div>
    </div>
  );
};
