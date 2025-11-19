import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Leaf, LayoutDashboard, LogOut, Sparkles, Users, ShoppingBag, Award } from 'lucide-react';

export function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">CarbonX</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>

              <Button
                variant={isActive('/contribute') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/contribute">
                  <Sparkles className="h-4 w-4 mr-2" />
                  My Impact
                </Link>
              </Button>


              <Button
                variant={isActive('/community') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/community">
                  <Users className="h-4 w-4 mr-2" />
                  Community
                </Link>
              </Button>

              <Button
                variant={isActive('/big-projects') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/big-projects">
                  <Award className="h-4 w-4 mr-2" />
                  Big Projects
                </Link>
              </Button>


              <Button
                variant={isActive('/marketplace') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/marketplace">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Link>
              </Button>

            </div>
          </div>

          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
