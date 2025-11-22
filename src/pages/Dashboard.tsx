import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Award, CheckCircle2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AchievementBadges } from '@/components/AchievementBadges';
import { ImpactStatistics } from '@/components/ImpactStatistics';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import ImageSlider from '@/components/ImageSlider';

interface Contribution {
  id: string;
  contribution_type: string;
  title: string;
  quantity: number;
  unit: string;
  verification_status: string;
  created_at: string;
  verified_at?: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContributions();
      
      //realtime subscription
      const channel = supabase
        .channel('dashboard-contributions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'individual_contributions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchContributions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchContributions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('individual_contributions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setContributions(data || []);
  };

  const verifiedCount = contributions.filter((c) => c.verification_status === 'verified').length;
  const pendingCount = contributions.filter((c) => c.verification_status === 'pending').length;
  
  // Calculate tokens
  const tokens = verifiedCount * 10 + contributions.reduce((sum, c) => 
    c.verification_status === 'verified' ? sum + c.quantity : sum, 0
  );
  
  const { achievements, unlockedCount, totalCount, completionPercentage } = useAchievements(contributions);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative">
  
  <div 
    className="fixed inset-0 z-0"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-emerald-50/50 to-teal-50/45" />
  </div>

  {/* Content */}
  <div className="relative z-10">
    <Navigation />
    
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-700">
          Track your climate impact and contributions
        </p>
      </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Climate Tokens</CardTitle>
              <Trophy className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{tokens}</div>
              <p className="text-xs text-muted-foreground">Earned from contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contributions.length}</div>
              <p className="text-xs text-muted-foreground">Climate actions tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground">AI verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ImpactStatistics contributions={contributions} />
          <AchievementBadges 
            achievements={achievements}
            unlockedCount={unlockedCount}
            totalCount={totalCount}
            completionPercentage={completionPercentage}
          />
          
        </div>



    
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
          <CardDescription>Your latest climate actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white/80 hover:bg-white transition-colors hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-medium">{contribution.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {contribution.contribution_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-medium">{contribution.quantity} {contribution.unit}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={contribution.verification_status === 'verified' ? 'default' : 'secondary'}
                  className={contribution.verification_status === 'verified' ? 'bg-green-600' : ''}
                >
                  {contribution.verification_status}
                </Badge>
              </div>
            ))}
            
            {contributions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No contributions yet. Visit My Impact to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      </main>
    </div>
    </div>
  );
}
