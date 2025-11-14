import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Achievement } from '@/hooks/useAchievements';
import { Lock } from 'lucide-react';

interface AchievementBadgesProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
}

export function AchievementBadges({ 
  achievements, 
  unlockedCount, 
  totalCount, 
  completionPercentage 
}: AchievementBadgesProps) {
  const categoryLabels = {
    contributions: 'Contributions',
    impact: 'Impact',
    consistency: 'Consistency',
    diversity: 'Diversity'
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Unlocked {unlockedCount} of {totalCount} badges ({completionPercentage}%)
        </CardDescription>
        <Progress value={completionPercentage} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg transition-all ${
                    achievement.unlocked
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                      {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <Badge variant="default" className="text-xs">Unlocked</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1.5"
                          />
                          <p className="text-xs text-muted-foreground">
                            {achievement.progress} / {achievement.maxProgress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
