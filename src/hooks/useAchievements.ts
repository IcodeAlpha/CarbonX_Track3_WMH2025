import { useMemo } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'contributions' | 'impact' | 'consistency' | 'diversity';
}

interface Contribution {
  id: string;
  contribution_type: string;
  quantity: number;
  verification_status: string;
  created_at: string;
}

export function useAchievements(contributions: Contribution[]) {
  const achievements = useMemo(() => {
    const verified = contributions.filter(c => c.verification_status === 'verified');
    const totalContributions = verified.length;
    const uniqueTypes = new Set(verified.map(c => c.contribution_type)).size;
    
    // Calculate total impact (sum of quantities)
    const totalImpact = verified.reduce((sum, c) => sum + c.quantity, 0);
    
    // Calculate consistency (contributions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContributions = verified.filter(c => new Date(c.created_at) > thirtyDaysAgo).length;

    const achievementList: Achievement[] = [
      // First steps
      {
        id: 'first_contribution',
        name: 'Climate Pioneer',
        description: 'Submit your first contribution',
        icon: '🌱',
        unlocked: totalContributions >= 1,
        progress: Math.min(totalContributions, 1),
        maxProgress: 1,
        category: 'contributions'
      },
      // Contribution milestones
      {
        id: 'contributor_5',
        name: 'Active Contributor',
        description: 'Submit 5 verified contributions',
        icon: '🌿',
        unlocked: totalContributions >= 5,
        progress: Math.min(totalContributions, 5),
        maxProgress: 5,
        category: 'contributions'
      },
      {
        id: 'contributor_10',
        name: 'Climate Champion',
        description: 'Submit 10 verified contributions',
        icon: '🏆',
        unlocked: totalContributions >= 10,
        progress: Math.min(totalContributions, 10),
        maxProgress: 10,
        category: 'contributions'
      },
      {
        id: 'contributor_25',
        name: 'Sustainability Leader',
        description: 'Submit 25 verified contributions',
        icon: '⭐',
        unlocked: totalContributions >= 25,
        progress: Math.min(totalContributions, 25),
        maxProgress: 25,
        category: 'contributions'
      },
      // Diversity badges
      {
        id: 'diverse_3',
        name: 'Versatile Activist',
        description: 'Try 3 different contribution types',
        icon: '🎯',
        unlocked: uniqueTypes >= 3,
        progress: Math.min(uniqueTypes, 3),
        maxProgress: 3,
        category: 'diversity'
      },
      {
        id: 'diverse_5',
        name: 'Eco Innovator',
        description: 'Try 5 different contribution types',
        icon: '💡',
        unlocked: uniqueTypes >= 5,
        progress: Math.min(uniqueTypes, 5),
        maxProgress: 5,
        category: 'diversity'
      },
      // Impact milestones
      {
        id: 'impact_100',
        name: 'Impact Maker',
        description: 'Achieve 100+ total impact units',
        icon: '🌍',
        unlocked: totalImpact >= 100,
        progress: Math.min(totalImpact, 100),
        maxProgress: 100,
        category: 'impact'
      },
      {
        id: 'impact_500',
        name: 'Change Leader',
        description: 'Achieve 500+ total impact units',
        icon: '🌟',
        unlocked: totalImpact >= 500,
        progress: Math.min(totalImpact, 500),
        maxProgress: 500,
        category: 'impact'
      },
      // Consistency badges
      {
        id: 'consistent_3',
        name: 'Dedicated Activist',
        description: '3+ contributions in the last 30 days',
        icon: '🔥',
        unlocked: recentContributions >= 3,
        progress: Math.min(recentContributions, 3),
        maxProgress: 3,
        category: 'consistency'
      },
      {
        id: 'consistent_7',
        name: 'Unstoppable Force',
        description: '7+ contributions in the last 30 days',
        icon: '⚡',
        unlocked: recentContributions >= 7,
        progress: Math.min(recentContributions, 7),
        maxProgress: 7,
        category: 'consistency'
      },
    ];

    return achievementList;
  }, [contributions]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
    completionPercentage: Math.round((unlockedCount / totalCount) * 100)
  };
}
