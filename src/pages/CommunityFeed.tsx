import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf, Trees, Droplets, Sun, Flower2, Heart, MessageCircle, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContributionMapWrapper } from "@/components/ContributionMapWrapper";
import { toast } from "sonner";

interface CommunityContribution {
  id: string;
  userName: string;
  userInitials: string;
  contribution_type: string;
  title: string;
  description: string;
  location: string;
  quantity: number;
  unit: string;
  tokens_earned: number;
  created_at: string;
  likes: number;
  comments: number;
  photo_urls?: string[];
  coordinates?: [number, number];
}

const getContributionIcon = (type: string) => {
  switch (type) {
    case 'tree_planting':
      return <Trees className="h-5 w-5" />;
    case 'water_conservation':
      return <Droplets className="h-5 w-5" />;
    case 'solar_panels':
      return <Sun className="h-5 w-5" />;
    case 'gardening':
      return <Flower2 className="h-5 w-5" />;
    default:
      return <Leaf className="h-5 w-5" />;
  }
};

const getContributionColor = (type: string) => {
  switch (type) {
    case 'tree_planting':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'water_conservation':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'solar_panels':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'gardening':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

const formatTimeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

//Parse location to extract coordinates
const parseLocation = (locationStr: string | null): [number, number] | undefined => {
  if (!locationStr) return undefined;

  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(locationStr);
    if (parsed.lat && parsed.lng) {
      return [parsed.lat, parsed.lng];
    }
    if (parsed.latitude && parsed.longitude) {
      return [parsed.latitude, parsed.longitude];
    }
  } catch {
    // Not JSON, might be comma-separated
    const parts = locationStr.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
  }

  return undefined;
};

export default function CommunityFeed() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [contributions, setContributions] = useState<CommunityContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  
  const fetchContributions = async (showToast = false) => {
  try {
    if (showToast) setRefreshing(true);
    else setLoading(true);

    setError(null);

    // Fetch contributions
    const { data: contributionsData, error: fetchError } = await supabase
      .from('individual_contributions')
      .select('*')
      .eq('verification_status', 'verified')
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error('Supabase error:', fetchError);
      throw fetchError;
    }

  
    const userIds = [...new Set(contributionsData?.map(c => c.user_id) || [])];

    
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', userIds);

    
    const profilesMap = new Map(
      profilesData?.map(p => [p.id, p]) || []
    );

    console.log('Fetched contributions:', contributionsData);

    // ADD GEOCODING HELPER FUNCTION
    const geocodeLocation = async (locationName: string): Promise<[number, number] | undefined> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
          {
            headers: {
              'User-Agent': 'CarbonX/1.0' 
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (error) {
        console.error('Geocoding error for', locationName, error);
      }
      return undefined;
    };

    // TRANSFORM DATA WITH GEOCODING
    const transformedData: CommunityContribution[] = await Promise.all(
      (contributionsData || []).map(async (item: any) => {
        const profile = profilesMap.get(item.user_id);
        const fullName = profile?.full_name || profile?.username || 'Anonymous User';
        const nameParts = fullName.split(' ');
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : fullName.substring(0, 2).toUpperCase();

        // Try to get coordinates from database first
        let coordinates: [number, number] | undefined;
        
        if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
          // Use stored coordinates
          coordinates = [item.coordinates.lat, item.coordinates.lng];
        } else if (item.location) {
          // Geocode the location name
          coordinates = await geocodeLocation(item.location);
          
          // Optional: Save coordinates back to database for future use
          if (coordinates) {
            await supabase
              .from('individual_contributions')
              .update({ 
                coordinates: { lat: coordinates[0], lng: coordinates[1] } 
              })
              .eq('id', item.id);
          }
        }

        console.log('Location:', item.location, 'Coordinates:', coordinates);

        return {
          id: item.id,
          userName: fullName,
          userInitials: initials,
          contribution_type: item.contribution_type,
          title: item.title,
          description: item.description || '',
          location: item.location || 'Unknown location',
          quantity: item.quantity,
          unit: item.unit,
          tokens_earned: 0,
          created_at: item.created_at,
          likes: 0,
          comments: 0,
          photo_urls: item.photo_urls,
          coordinates: coordinates
        };
      })
    );

    setContributions(transformedData);

    if (showToast) {
      toast.success(`Refreshed! Found ${transformedData.length} contributions`);
    }
  } catch (err: any) {
    console.error('Error fetching contributions:', err);
    setError(err.message || 'Failed to load contributions');
    toast.error('Failed to load contributions: ' + err.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    if (user) {
      fetchContributions();
    }
  }, [user]);

  // Update real-time subscription 
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('individual-contributions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'individual_contributions' 
        },
        (payload) => {
          console.log('Contribution changed:', payload);
          fetchContributions(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  
  const handleLike = async (contributionId: string) => {
    if (!user) {
      toast.error('Please login to like contributions');
      return;
    }

    try {
      // Check if contribution_likes table exists
      const { data: existingLike } = await supabase
        .from('contribution_likes')
        .select('id')
        .eq('contribution_id', contributionId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('contribution_likes')
          .delete()
          .eq('id', existingLike.id);

        setContributions(prev =>
          prev.map(c =>
            c.id === contributionId
              ? { ...c, likes: Math.max(0, c.likes - 1) }
              : c
          )
        );
        toast.success('Like removed');
      } else {
        await supabase
          .from('contribution_likes')
          .insert({
            contribution_id: contributionId,
            user_id: user.id,
          });

        setContributions(prev =>
          prev.map(c =>
            c.id === contributionId
              ? { ...c, likes: c.likes + 1 }
              : c
          )
        );
        toast.success('Liked!');
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      
      if (err.message?.includes('relation "contribution_likes" does not exist')) {
        toast.info('Like feature coming soon!');
      } else {
        toast.error('Failed to update like');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community contributions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchContributions()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
  {/* Background Image */}
  <div 
    className="fixed inset-0 z-0"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop')`,
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
            Community Feed
          </h1>
          <p className="text-gray-700 mt-2">
            See what others are doing for the planet
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchContributions(true)}
          disabled={refreshing}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="flex gap-4 flex-wrap items-center">
          <span className="text-sm font-medium text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Tree Planting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm">Water Conservation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Solar Panels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span className="text-sm">Gardening</span>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Global Contributions Map
            <Badge variant="secondary" className="ml-auto">
              {contributions.filter(c => c.coordinates).length} locations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ContributionMapWrapper
            contributions={contributions}
            height="500px"
          />
        </CardContent>
      </Card>

      {contributions.length === 0 && (
        <Card className="p-12 bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No contributions yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your environmental contribution!
            </p>
            <Button onClick={() => navigate('/contribute')}>
              Add Contribution
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {contributions.map((contribution) => (
          <Card
            key={contribution.id}
            className="p-6 bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20"
          >
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold">
                  {contribution.userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{contribution.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(contribution.created_at)}
                    </p>
                  </div>
                  <Badge className={`${getContributionColor(contribution.contribution_type)} border`}>
                    <span className="mr-1">{getContributionIcon(contribution.contribution_type)}</span>
                    {contribution.contribution_type.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {contribution.title}
                  </h3>
                  <p className="text-muted-foreground mb-2">{contribution.description}</p>

                  {contribution.photo_urls && contribution.photo_urls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {contribution.photo_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${contribution.title} photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {contribution.location}
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {contribution.quantity} {contribution.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      onClick={() => handleLike(contribution.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {contribution.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {contribution.comments}
                    </Button>
                  </div>
                  {contribution.tokens_earned > 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 border font-semibold">
                      +{contribution.tokens_earned} tokens
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
</div>
  );
}