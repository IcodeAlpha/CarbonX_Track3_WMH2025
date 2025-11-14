import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';

interface Contribution {
  id: string;
  contribution_type: string;
  quantity: number;
  unit: string;
  verification_status: string;
  created_at: string;
}

interface ImpactStatisticsProps {
  contributions: Contribution[];
}

export function ImpactStatistics({ contributions }: ImpactStatisticsProps) {
  const verified = contributions.filter(c => c.verification_status === 'verified');
  
  // Calculate statistics
  const totalImpact = verified.reduce((sum, c) => sum + c.quantity, 0);
  const uniqueTypes = new Set(verified.map(c => c.contribution_type)).size;
  
  // Calculate monthly average
  const firstContribution = verified.length > 0 
    ? new Date(verified[verified.length - 1].created_at) 
    : new Date();
  const monthsSinceFirst = Math.max(
    1,
    Math.ceil((Date.now() - firstContribution.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );
  const monthlyAverage = Math.round(verified.length / monthsSinceFirst);
  
  // Calculate this month's contributions
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = verified.filter(
    c => new Date(c.created_at) >= firstDayOfMonth
  ).length;

  // Get most common contribution type
  const typeCounts = verified.reduce((acc, c) => {
    acc[c.contribution_type] = (acc[c.contribution_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0];
  const mostCommonTypeLabel = mostCommonType 
    ? mostCommonType[0].replace(/_/g, ' ')
    : 'None yet';

  const stats = [
    {
      title: 'Total Impact Units',
      value: totalImpact.toLocaleString(),
      description: 'Combined impact from all contributions',
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      title: 'This Month',
      value: thisMonthCount.toString(),
      description: `${monthlyAverage} per month average`,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Contribution Types',
      value: uniqueTypes.toString(),
      description: `Most common: ${mostCommonTypeLabel}`,
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Verified Actions',
      value: verified.length.toString(),
      description: `${contributions.length - verified.length} pending`,
      icon: Zap,
      color: 'text-orange-600'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Statistics</CardTitle>
        <CardDescription>Your climate action breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
