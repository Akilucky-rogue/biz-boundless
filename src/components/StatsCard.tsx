import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  gradient = false 
}: StatsCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-success";
      case "negative": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className={`stats-card ${gradient ? "bg-gradient-primary text-primary-foreground" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-medium ${gradient ? "text-primary-foreground/80" : "text-muted-foreground"} truncate`}>
            {title}
          </p>
          <p className={`text-lg sm:text-2xl font-bold mt-1 ${gradient ? "text-primary-foreground" : "text-foreground"}`}>
            {value}
          </p>
          {change && (
            <p className={`text-xs mt-1 ${gradient ? "text-primary-foreground/80" : getChangeColor()} truncate`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 rounded-lg ${gradient ? "bg-primary-foreground/20" : "bg-muted"} shrink-0`}>
          <Icon size={16} className={`sm:w-5 sm:h-5 ${gradient ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
};