import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Award } from 'lucide-react';

interface CreditCardProps {
  credit: {
    id: string;
    project_name: string;
    project_type: string;
    description: string;
    location: string;
    vintage: number;
    available_tonnes: number;
    price_per_tonne: number;
    verification_standard: string;
    image_url: string;
  };
  onBuy: (creditId: string) => void;
}

const projectTypeColors: Record<string, string> = {
  solar_energy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  clean_cooking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  biogas: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  reforestation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const formatProjectType = (type: string): string => {
  const formatted: Record<string, string> = {
    solar_energy: 'Solar Energy',
    clean_cooking: 'Clean Cooking',
    biogas: 'Biogas',
    reforestation: 'Reforestation',
  };
  return formatted[type] || type;
};

export function CreditCard({ credit, onBuy }: CreditCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={credit.image_url}
          alt={credit.project_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{credit.project_name}</CardTitle>
          <Badge className={projectTypeColors[credit.project_type] || 'bg-secondary'}>
            {formatProjectType(credit.project_type)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{credit.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{credit.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Vintage {credit.vintage}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>{credit.verification_standard}</span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">${credit.price_per_tonne}</p>
              <p className="text-xs text-muted-foreground">per tonne CO₂e</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{credit.available_tonnes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">tonnes available</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onBuy(credit.id)} className="w-full">
          Buy Credits
        </Button>
      </CardFooter>
    </Card>
  );
}
