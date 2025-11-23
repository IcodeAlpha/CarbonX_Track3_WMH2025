import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Leaf, LayoutDashboard, LogOut, Sparkles, Users, Award, Menu, X } from 'lucide-react';

export function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contribute', label: 'My Impact', icon: Sparkles },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/big-projects', label: 'Big Projects', icon: Award },
    // { path: '/heatmap', label: 'Heat Map', icon: MapPin },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">CarbonX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  variant={isActive(link.path) ? 'default' : 'ghost'}
                  asChild
                >
                  <Link to={link.path}>
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Desktop Sign Out */}
          <Button variant="ghost" onClick={signOut} className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          {/* Mobile Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  CarbonX
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.path}
                      variant={isActive(link.path) ? 'default' : 'outline'}
                      asChild
                      className="w-full justify-start text-lg h-12"
                      onClick={handleLinkClick}
                    >
                      <Link to={link.path}>
                        <Icon className="h-5 w-5 mr-3" />
                        {link.label}
                      </Link>
                    </Button>
                  );
                })}

                <div className="border-t pt-4 mt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleLinkClick();
                      signOut();
                    }}
                    className="w-full justify-start text-lg h-12"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}