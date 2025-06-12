
import { useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, Download, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UtangManageModuleProps {
  onClose: () => void;
}

export const UtangManageModule = ({ onClose }: UtangManageModuleProps) => {
  const { credits, updateCreditStatus, getTotalUnpaid, getGroupedCredits } = useCredits();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'individual' | 'grouped'>('grouped');

  const handleStatusChange = async (creditId: string) => {
    const result = await updateCreditStatus(creditId, 'paid');
    if (result.success) {
      toast({
        title: "Status updated!",
        description: "Credit status changed to paid and added to revenue."
      });
    }
  };

  const exportToExcel = () => {
    const headers = ['Date', 'Customer', 'Items', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...credits.map(credit => [
        new Date(credit.created_at).toLocaleDateString(),
        credit.customer_name,
        credit.items.map((item: any) => `${item.product_name || item.type} (${item.quantity || 1})`).join('; '),
        credit.total_amount,
        credit.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `customer-credits-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredCredits = credits.filter(credit => {
    const matchesSearch = credit.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedCredits = getGroupedCredits();
  const filteredGroupedCredits = Object.entries(groupedCredits).filter(([customerName, customerCredits]) => {
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customerCredits.some(credit => credit.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const renderCreditCard = (credit: any) => (
    <Card key={credit.id} className={credit.status === 'paid' ? 'bg-green-50 dark:bg-green-950' : 'bg-orange-50 dark:bg-orange-950'}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold">{credit.customer_name}</h4>
              <Badge variant={credit.status === 'paid' ? 'default' : 'destructive'}>
                {credit.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(credit.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-lg font-bold text-orange-600 mb-2">
              ₱{credit.total_amount.toLocaleString()}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Items: {credit.items.map((item: any, index: number) => (
                <span key={index}>
                  {item.product_name || `${item.type} (${item.network || item.transaction_type || item.bill_type})`}
                  {item.quantity && ` (${item.quantity})`}
                  {index < credit.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {credit.status === 'unpaid' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Paid
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-xl p-8 rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-bold mb-2 text-center">
                    Confirm Payment
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-lg text-gray-700 mb-6 text-center">
                    Are you sure you want to mark this credit for <span className="font-semibold">{credit.customer_name}</span> <br />
                    <span className="text-orange-700 font-bold text-xl">₱{credit.total_amount.toLocaleString()}</span> as paid?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row justify-center gap-4 mt-4">
                  <AlertDialogCancel className="px-6 py-3 text-lg rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700 rounded-lg"
                    onClick={() => handleStatusChange(credit.id)}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderGroupedCredits = () => {
    return filteredGroupedCredits.map(([customerName, customerCredits]) => {
      const totalUnpaid = customerCredits.filter(c => !c.is_paid).reduce((sum, c) => sum + c.amount_owed, 0);
      const totalPaid = customerCredits.filter(c => c.is_paid).reduce((sum, c) => sum + c.amount_owed, 0);
      
      return (
        <Card key={customerName} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                {customerCredits[0].customer_name} {/* Use original casing from first record */}
              </CardTitle>
              <div className="flex space-x-2">
                {totalUnpaid > 0 && (
                  <Badge variant="destructive">
                    Unpaid: ₱{totalUnpaid.toLocaleString()}
                  </Badge>
                )}
                {totalPaid > 0 && (
                  <Badge variant="default">
                    Paid: ₱{totalPaid.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customerCredits.map(credit => renderCreditCard(credit))}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          {/* View Mode Toggle */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'outline'}
              onClick={() => setViewMode('grouped')}
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              Group by Customer
            </Button>
            <Button
              variant={viewMode === 'individual' ? 'default' : 'outline'}
              onClick={() => setViewMode('individual')}
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Individual Records
            </Button>
          </div> */}

          {/* Search and Filter Controls */}
          <div className="flex space-x-4 mb-6 m-6">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search customers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" // add left padding to move text right of icon
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToExcel} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Credits List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {viewMode === 'grouped' ? renderGroupedCredits() : (
              <>
                {filteredCredits.map(credit => renderCreditCard(credit))}
                
                {filteredCredits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4" />
                    <p>No credits found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
