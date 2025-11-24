import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, Users, Leaf, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import HeatMapWrapper from '@/components/HeatMapWrapper';

export default function HeatMapPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalLocations: 0,
    topLocation: '',
    mostActiveType: ''
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    setLoading(true);
    try {
      
      const { data, error } = await supabase
        .from('individual_contributions')
        .select('*')
        .eq('verification_status', 'verified')
        .not('coordinates', 'is', null);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        setContributions([]);
        return;
      }

      // Filter contributions with valid coordinates
      const validContributions = data.filter(c => {
        if (!c.coordinates) return false;
        
        // Handle both formats: {lat, lng} and [lat, lng]
        if (typeof c.coordinates === 'object') {
          // Format 1: {lat: number, lng: number}
          if (c.coordinates.lat && c.coordinates.lng) {
            return true;
          }
          // Format 2: [lat, lng]
          if (Array.isArray(c.coordinates) && c.coordinates.length === 2) {
            return true;
          }
        }
        return false;
      });

      console.log('Valid contributions with coordinates:', validContributions.length);
      setContributions(validContributions);
      calculateStats(validContributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const locationCounts = {};
    const typeCounts = {};

    data.forEach(contribution => {
     
      if (contribution.location) {
        locationCounts[contribution.location] = (locationCounts[contribution.location] || 0) + 1;
      }
      
      
      if (contribution.contribution_type) {
        typeCounts[contribution.contribution_type] = (typeCounts[contribution.contribution_type] || 0) + 1;
      }
    });

    const topLocation = Object.keys(locationCounts).reduce((a, b) => 
      locationCounts[a] > locationCounts[b] ? a : b, 
      'N/A'
    );

    const mostActiveType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b,
      'N/A'
    );

    setStats({
      totalContributions: data.length,
      totalLocations: Object.keys(locationCounts).length,
      topLocation,
      mostActiveType: mostActiveType.replace(/_/g, ' ')
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2070&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/93 via-indigo-50/89 to-purple-50/85 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
                  Contributions Heat Map
                </h1>
                <p className="text-gray-700">
                  Visualize the geographic distribution and intensity of verified climate contributions across Kenya
                </p>
              </div>
              <Button
                onClick={fetchContributions}
                disabled={loading}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm shadow-md border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                <Leaf className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">{stats.totalContributions}</div>
                <p className="text-xs text-muted-foreground">Verified with coordinates</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-md border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
                <MapPin className="h-5 w-5 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-700">{stats.totalLocations}</div>
                <p className="text-xs text-muted-foreground">Different areas covered</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-md border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Location</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-700 truncate">{stats.topLocation}</div>
                <p className="text-xs text-muted-foreground">Most contributions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-md border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Type</CardTitle>
                <Users className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-700 capitalize">{stats.mostActiveType}</div>
                <p className="text-xs text-muted-foreground">Popular activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Heat Map */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                Geographic Distribution Heat Map
                <Badge variant="secondary" className="ml-auto">
                  {contributions.length} points
                </Badge>
              </CardTitle>
              <CardDescription>
                Red areas indicate higher concentration of contributions. Zoom and pan to explore different regions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                  Loading contributions...
                </div>
              ) : contributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                  <Leaf className="h-16 w-16 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-semibold mb-2">No contributions with coordinates yet</p>
                  <p className="text-sm">Start adding contributions with locations to see the heat map!</p>
                </div>
              ) : (
                <HeatMapWrapper 
                  contributions={contributions}
                  height="600px"
                />
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                🗺️ Heat Map Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-indigo-800 mb-2">Color Intensity</h4>
                  <ul className="space-y-1 text-indigo-700">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-400"></div>
                      Low activity (1-5 contributions)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-400"></div>
                      Medium activity (6-15 contributions)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      High activity (16+ contributions)
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-indigo-800 mb-2">Map Controls</h4>
                  <ul className="space-y-1 text-indigo-700">
                    <li>• Zoom in/out to see detailed clusters</li>
                    <li>• Click and drag to pan across regions</li>
                    <li>• Heat intensity updates in real-time</li>
                    <li>• Only verified contributions are shown</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}