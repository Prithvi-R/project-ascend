import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Zap, Crown } from "lucide-react";

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

interface PlayerRadarChartProps {
  stats: PlayerStats;
  className?: string;
}

const statNames = {
  STR: "Strength",
  AGI: "Agility", 
  END: "Endurance",
  INT: "Intelligence",
  CHA: "Charisma",
};

export function PlayerRadarChart({ stats, className }: PlayerRadarChartProps) {
  if (!stats) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        No player stats provided
      </div>
    );
  }

  // Transform data for radar chart
  const radarData = Object.entries(stats.attributes).map(([key, data]) => ({
    attribute: statNames[key as keyof typeof statNames],
    value: data.value,
    fullMark: 25, // Max value for the radar chart
  }));

  return (
    <div className={`${className || ''}`}>
      <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold">Character Stats</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
              <Zap className="w-3 h-3 mr-1" />
              Level {stats.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid 
                  stroke="hsl(220 13% 91%)" 
                  strokeWidth={1.5}
                  fill="hsl(220 14.3% 95.9%)"
                  fillOpacity={0.3}
                />
                <PolarAngleAxis 
                  dataKey="attribute" 
                  tick={{ 
                    fontSize: 12, 
                    fontWeight: 600,
                    fill: "hsl(215.4 16.3% 46.9%)"
                  }}
                  className="text-slate-700"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 25]} 
                  tick={{ 
                    fontSize: 10, 
                    fill: "hsl(215.4 16.3% 46.9%)"
                  }}
                  tickCount={6}
                  stroke="hsl(220 13% 91%)"
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke="hsl(262.1 83.3% 57.8%)" // Purple-600
                  fill="hsl(262.1 83.3% 57.8%)"
                  fillOpacity={0.25}
                  strokeWidth={3}
                  dot={{ 
                    fill: "hsl(262.1 83.3% 57.8%)", 
                    strokeWidth: 2, 
                    stroke: "white",
                    r: 5 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {Object.entries(stats.attributes).map(([key, data]) => (
              <div key={key} className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-lg font-bold text-slate-900">{data.value}</div>
                <div className="text-xs text-slate-600 font-medium">{key}</div>
                <div className="text-xs text-slate-500">{data.xp} XP</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}