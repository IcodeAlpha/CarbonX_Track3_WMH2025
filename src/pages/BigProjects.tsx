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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Government & NGO Sponsored Projects
          </h1>
          <p className="text-muted-foreground">
            Explore large-scale climate projects supported by governments and NGOs in Kenya.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="border hover:shadow-lg transition-shadow">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.project_name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.project_name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {project.project_type.replace(/_/g, ' ')}
                    </CardDescription>
                  </CardHeader>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex justify-between items-center text-sm mt-4">
                    <Badge className="bg-primary/10 text-primary">{project.verification_standard || 'N/A'}</Badge>
                    <span>{project.location}</span>
                  </div>
                  <div className="mt-2 text-sm flex justify-between">
                    <span>Available: {project.available_tonnes} t</span>
                    <span>Price: ${project.price_per_tonne.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
