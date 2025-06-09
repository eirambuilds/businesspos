
import { useState } from 'react';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Activity } from 'lucide-react';

interface ActivityLogModuleProps {
  onClose: () => void;
}

export const ActivityLogModule = ({ onClose }: ActivityLogModuleProps) => {
  const { logs, loading } = useActivityLog();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'inventory': return 'bg-blue-100 text-blue-800';
      case 'credit': return 'bg-yellow-100 text-yellow-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Transaction Log</DialogTitle>
        <DialogDescription>
          Lahat ng activities sa sistema
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No logs found matching your search.' : 'No activity logs yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        by {log.user_email}
                      </span>
                    </div>
                    <p className="font-medium">{log.description}</p>
                    {log.affected_data && Object.keys(log.affected_data).length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Data: {JSON.stringify(log.affected_data, null, 2).slice(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{new Date(log.created_at).toLocaleDateString()}</p>
                    <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
