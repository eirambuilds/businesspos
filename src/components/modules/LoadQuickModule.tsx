
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Plus, Minus } from 'lucide-react';
import { useLoad } from '@/hooks/useLoad';
import { useToast } from '@/hooks/use-toast';

interface LoadQuickModuleProps {
  onClose: () => void;
}

export const LoadQuickModule = ({ onClose }: LoadQuickModuleProps) => {
  const { addLoadSale } = useLoad();
  const { toast } = useToast();
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState(0);
  const [showOtherAmount, setShowOtherAmount] = useState(false);

  const networks = ['Globe', 'Smart', 'Sun', 'TM', 'TNT'];
  const commonAmounts = [15, 20, 25, 30, 50, 100, 150, 200, 300, 500];

  const calculateKita = (loadAmount: number) => {
    if (loadAmount >= 5 && loadAmount <= 90) return 3;
    if (loadAmount >= 91 && loadAmount <= 190) return 5;
    return 10;
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const adjustAmount = (increment: number) => {
    const newAmount = Math.max(5, amount + increment);
    // Ensure amount is divisible by 5
    const roundedAmount = Math.round(newAmount / 5) * 5;
    setAmount(roundedAmount);
  };

  const handleSubmit = async () => {
    if (!network || amount < 5) {
      toast({
        title: "Kulang ang datos!",
        description: "Piliin ang network at amount na hindi bababa sa ₱5.",
        variant: "destructive"
      });
      return;
    }

    const result = await addLoadSale(network, amount);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <Smartphone className="h-6 w-6 mr-2 text-green-600" />
          Load Quick Button
        </DialogTitle>
        <DialogDescription>
          Mag-record ng load sale
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="network">Network</Label>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger>
              <SelectValue placeholder="Piliin ang network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((net) => (
                <SelectItem key={net} value={net}>
                  {net}
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
                  onClick={() => adjustAmount(-5)}
                  disabled={amount <= 5}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={5}
                  step={5}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(5)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {amount > 0 && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Kita:</span>
                <span className="text-lg font-bold text-green-600">
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
          <Button onClick={handleSubmit} className="flex-1 bg-green-500 hover:bg-green-600">
            Record Load Sale
          </Button>
        </div>
      </div>
    </div>
  );
};
