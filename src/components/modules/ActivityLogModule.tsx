
import { useState } from 'react';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Download, User, Activity, Filter } from 'lucide-react';

interface ActivityLogModuleProps {
  onClose: () => void;
}

export const ActivityLogModule = ({ onClose }: ActivityLogModuleProps) => {
  const { logs, loading } = useActivityLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const actionTypes = [...new Set(logs.map(log => log.action_type))];
  
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = new Date(log.created_at).toDateString() === new Date().toDateString();
    } else if (filterDate === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(log.created_at) >= weekAgo;
    } else if (filterDate === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(log.created_at) >= monthAgo;
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'User', 'Action', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleDateString(),
        new Date(log.created_at).toLocaleTimeString(),
        log.user_email,
        log.action_type,
        `"${log.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-green-500',
      'UPDATE': 'bg-blue-500',
      'DELETE': 'bg-red-500',
      'LOGIN': 'bg-purple-500',
      'LOGOUT': 'bg-gray-500',
      'SALE': 'bg-orange-500',
      'CREDIT': 'bg-yellow-500'
    };
    return colors[action.toUpperCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Activity Log
        </DialogTitle>
        <DialogDescription>
          System history and admin actions throughout the store management system
        </DialogDescription>
      </DialogHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Actions</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(log => new Date(log.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(logs.map(log => log.user_email)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Types</p>
                <p className="text-2xl font-bold text-orange-600">{actionTypes.length}</p>
              </div>
              <Filter className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map((action) => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`${getActionBadgeColor(log.action_type)} text-white`}>
                      {log.action_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {log.user_email}
                    </span>
                  </div>
                  
                  <p className="text-sm">{log.description}</p>
                  
                  {log.affected_data && Object.keys(log.affected_data).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <span className="font-medium">Affected Data: </span>
                      <span className="text-muted-foreground">
                        {JSON.stringify(log.affected_data, null, 2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <p>No activities found</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
