import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf, Trees, Droplets, Sun, Flower2, Heart, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContributionMapWrapper } from "@/components/ContributionMapWrapper";

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

const mockCommunityData: CommunityContribution[] = [
  {
    id: '1',
    userName: 'Sarah Green',
    userInitials: 'SG',
    contribution_type: 'tree_planting',
    title: 'Planted 100 Native Trees',
    description: 'Organized community event to plant native species in local forest',
    location: 'Riverside Forest',
    quantity: 100,
    unit: 'trees',
    tokens_earned: 500,
    created_at: new Date().toISOString(),
    likes: 45,
    comments: 12,
    coordinates: [45.5152, -122.6784],
  },
  {
    id: '2',
    userName: 'Mike Waters',
    userInitials: 'MW',
    contribution_type: 'water_conservation',
    title: 'Rainwater Harvesting System',
    description: 'Installed rainwater collection system saving 5000L per month',
    location: 'Home',
    quantity: 5000,
    unit: 'liters/month',
    tokens_earned: 300,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes: 32,
    comments: 8,
    coordinates: [30.2672, -97.7431],
  },
  {
    id: '3',
    userName: 'Emma Solar',
    userInitials: 'ES',
    contribution_type: 'solar_panels',
    title: 'Solar Panel Installation',
    description: 'Switched to 100% solar energy for home',
    location: 'Suburban Area',
    quantity: 12,
    unit: 'panels',
    tokens_earned: 800,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: 67,
    comments: 15,
    coordinates: [40.7128, -74.0060],
  },
  {
    id: '4',
    userName: 'John Plant',
    userInitials: 'JP',
    contribution_type: 'gardening',
    title: 'Community Garden with Mums',
    description: 'Started organic garden with beautiful chrysanthemums and vegetables',
    location: 'Community Center',
    quantity: 1,
    unit: 'garden',
    tokens_earned: 150,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: 28,
    comments: 6,
    coordinates: [34.0522, -118.2437],
  },
  {
    id: '5',
    userName: 'Lisa Bloom',
    userInitials: 'LB',
    contribution_type: 'gardening',
    title: 'Pollinator Garden',
    description: 'Created wildflower garden to support bees and butterflies',
    location: 'Backyard',
    quantity: 1,
    unit: 'garden',
    tokens_earned: 200,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    likes: 41,
    comments: 9,
    coordinates: [47.6062, -122.3321],
  }
];

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
      return 'bg-green-500/10 text-green-500';
    case 'water_conservation':
      return 'bg-blue-500/10 text-blue-500';
    case 'solar_panels':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'gardening':
      return 'bg-pink-500/10 text-pink-500';
    default:
      return 'bg-primary/10 text-primary';
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

export default function CommunityFeed() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contributions] = useState<CommunityContribution[]>(mockCommunityData);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Community Feed</h1>
            <p className="text-muted-foreground mt-2">See what others are doing for the planet</p>
          </div>
        </div>

        {/* Map Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Global Contributions Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ContributionMapWrapper contributions={contributions} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {contributions.map((contribution) => (
            <Card key={contribution.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {contribution.userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{contribution.userName}</p>
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(contribution.created_at)}</p>
                    </div>
                    <Badge className={`${getContributionColor(contribution.contribution_type)} border-0`}>
                      <span className="mr-1">{getContributionIcon(contribution.contribution_type)}</span>
                      {contribution.contribution_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{contribution.title}</h3>
                    <p className="text-muted-foreground mb-2">{contribution.description}</p>

                    {contribution.photo_urls && contribution.photo_urls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {contribution.photo_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${contribution.title} photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Leaf className="h-4 w-4 mr-1" />
                        {contribution.location}
                      </span>
                      <span>•</span>
                      <span>{contribution.quantity} {contribution.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Heart className="h-4 w-4 mr-1" />
                        {contribution.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {contribution.comments}
                      </Button>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 font-semibold">
                      +{contribution.tokens_earned} tokens
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
