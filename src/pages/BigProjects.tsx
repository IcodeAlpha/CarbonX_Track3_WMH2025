import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  description: string | null;
  location: string | null;
  vintage: number | null;
  total_tonnes: number;
  available_tonnes: number;
  price_per_tonne: number;
  verification_standard: string | null;
  image_url: string | null;
}

export default function BigProjects() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('carbon_credits')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching projects:', error);
    }
    setProjects(data || []);
    setLoading(false);
  };

  return (
 <div className="min-h-screen relative">
  {/* Background Image - Large-scale wind/solar farm */}
  <div 
    className="fixed inset-0 z-0"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/91 via-sky-50/87 to-blue-50/83 backdrop-blur-sm" />
  </div>

  {/* Content */}
  <div className="relative z-10">
    <Navigation />

    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
          Government & NGO Sponsored Projects
        </h1>
        <p className="text-gray-700">
          Explore large-scale climate projects supported by governments and NGOs in Kenya.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="border-2 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:border-primary/50 animate-float hover:scale-105 hover:-rotate-1 duration-300"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.project_name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="pt-4">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg">{project.project_name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {project.project_type.replace(/_/g, ' ')}
                  </CardDescription>
                </CardHeader>
                <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                <div className="flex justify-between items-center text-sm mt-4">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {project.verification_standard || 'N/A'}
                  </Badge>
                  <span className="text-muted-foreground">{project.location}</span>
                </div>
                <div className="mt-4 pt-4 border-t text-sm flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="font-bold text-blue-700">{project.available_tonnes} t</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-bold text-green-700">${project.price_per_tonne.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  </div>

  {/* Floating Animation Styles */}
  <style>{`
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(0.5deg);
      }
    }

    .animate-float {
      animation: float 4s ease-in-out infinite;
    }

    .animate-float:hover {
      animation-play-state: paused;
    }
  `}</style>
</div>
  );
}
