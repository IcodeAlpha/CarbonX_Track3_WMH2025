import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Leaf, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerifiedContribution {
  id: string;
  title: string;
  contribution_type: string;
  description?: string;
  location?: string;
  quantity: number;
  unit: string;
  verification_method?: string;
  blockchain_hash?: string;
  impact_metrics?: any;
  photo_urls?: string[];
  verified_at?: string;
}

export default function Marketplace() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<VerifiedContribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<VerifiedContribution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchContributions();
  }, []);

  useEffect(() => {
    filterContributions();
  }, [contributions, searchQuery, filterType]);

  const fetchContributions = async () => {
    const { data, error } = await supabase
      .from('individual_contributions')
      .select('*')
      .eq('verification_status', 'verified')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load contributions:', error);
      return;
    }

    setContributions(data || []);
  };

  const filterContributions = () => {
    let filtered = contributions;

    if (searchQuery) {
      filtered = filtered.filter(
        (contribution) =>
          contribution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contribution.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((contribution) => contribution.contribution_type === filterType);
    }

    setFilteredContributions(filtered);
  };

  const formatProjectType = (type: string) => {
    const formatted: Record<string, string> = {
      solar_energy: "Solar Energy",
      clean_cooking: "Clean Cooking",
      biogas: "Biogas",
      reforestation: "Reforestation",
      tree_planting: "Tree Planting",
      home_solar: "Home Solar Panel",
      composting: "Composting",
      rainwater_harvesting: "Rainwater Harvesting",
    };
    return formatted[type] || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Verified Contributions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore verified climate contributions from communities and individuals across Kenya, tracked transparently on-chain
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Input
              placeholder="Search by project or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="solar_energy">Solar Energy</SelectItem>
              <SelectItem value="clean_cooking">Clean Cooking</SelectItem>
              <SelectItem value="biogas">Biogas</SelectItem>
              <SelectItem value="reforestation">Reforestation</SelectItem>
              <SelectItem value="tree_planting">Tree Planting</SelectItem>
              <SelectItem value="home_solar">Home Solar</SelectItem>
              <SelectItem value="composting">Composting</SelectItem>
              <SelectItem value="rainwater_harvesting">Rainwater Harvesting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg p-8 border">
            <Zap className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <p className="text-muted-foreground mb-2">No verified contributions found.</p>
            <p className="text-sm text-muted-foreground">Be the first to contribute!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContributions.map((contribution) => (
              <Card key={contribution.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{contribution.title}</span>
                    {contribution.blockchain_hash && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        On-chain ✓
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {formatProjectType(contribution.contribution_type)}
                    </Badge>
                    {contribution.location && (
                      <p className="text-sm text-muted-foreground">{contribution.location}</p>
                    )}
                  </div>

                  {contribution.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contribution.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Impact</p>
                      <p className="text-lg font-bold">{contribution.quantity} {contribution.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verified By</p>
                      <p className="text-sm font-medium">{contribution.verification_method || 'AI Verification'}</p>
                    </div>
                  </div>

                  {contribution.impact_metrics && (
                    <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                      {Object.entries(contribution.impact_metrics).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
