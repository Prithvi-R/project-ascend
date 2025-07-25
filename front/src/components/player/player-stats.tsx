import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Zap,
  Sword,
  Wind,
  Heart,
  Brain,
  Users,
  TrendingUp,
} from "lucide-react";

interface PlayerStats {
  level: number;
  total_xp: number;
  xp_to_next_level: number;
  attributes: {
    STR: { value: number; xp: number };
    AGI: { value: number; xp: number };
    END: { value: number; xp: number };
    INT: { value: number; xp: number };
    CHA: { value: number; xp: number };
  };
}

interface PlayerStatsProps {
  stats: PlayerStats;
  className?: string;
}

const statIcons = {
  STR: Sword,
  AGI: Wind,
  END: Heart,
  INT: Brain,
  CHA: Users,
};

const statColors = {
  STR: "text-red-600 bg-red-100 border-red-200",
  AGI: "text-green-600 bg-green-100 border-green-200",
  END: "text-blue-600 bg-blue-100 border-blue-200",
  INT: "text-purple-600 bg-purple-100 border-purple-200",
  CHA: "text-yellow-600 bg-yellow-100 border-yellow-200",
};

const statNames = {
  STR: "Strength",
  AGI: "Agility",
  END: "Endurance",
  INT: "Intelligence",
  CHA: "Charisma",
};

export function PlayerStatsComponent({ stats, className }: PlayerStatsProps) {
  console.log("PlayerStatsComponent rendering with stats:", stats);
  
  if (!stats) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        No player stats provided
      </div>
    );
  }

  const levelProgress = ((stats.total_xp % 1000) / 1000) * 100; // Assuming 1000 XP per level

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Level and Overall Progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold">Level {stats.level}</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
              <Zap className="w-3 h-3 mr-1" />
              {stats.total_xp.toLocaleString()} XP
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.xp_to_next_level.toLocaleString()} XP needed</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="flex items-center justify-center space-x-1 text-xs text-slate-500">
              <TrendingUp className="w-3 h-3" />
              <span>Keep training to level up!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(stats.attributes).map(([statKey, statData]) => {
          const Icon = statIcons[statKey as keyof typeof statIcons];
          const colorClass = statColors[statKey as keyof typeof statColors];
          const statName = statNames[statKey as keyof typeof statNames];
          
          // Calculate progress to next stat level (assuming 100 XP per stat level)
          const statProgress = ((statData.xp % 100) / 100) * 100;
          
          return (
            <Card key={statKey} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {statData.value}
                    </div>
                    <div className="text-xs text-slate-500">
                      {statData.xp} XP
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      {statName}
                    </span>
                    <span className="text-xs text-slate-500">
                      Lv {statData.value}
                    </span>
                  </div>
                  <Progress value={statProgress} className="h-2" />
                  <div className="text-xs text-slate-500 text-center">
                    {100 - (statData.xp % 100)} XP to next level
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {Object.values(stats.attributes).reduce((sum, stat) => sum + stat.value, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Stats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {Math.max(...Object.values(stats.attributes).map(stat => stat.value))}
              </div>
              <div className="text-sm text-slate-600">Highest Stat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.level}
              </div>
              <div className="text-sm text-slate-600">Player Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.total_xp.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total XP</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}