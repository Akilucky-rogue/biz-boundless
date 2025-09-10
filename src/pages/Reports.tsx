import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { ReportsActions } from "@/components/ReportsActions";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Mock report data
  const reportStats = [
    {
      title: "Revenue",
      value: "₹45,230",
      change: "+15.3% vs last week",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Orders",
      value: "156",
      change: "+12 new orders",
      changeType: "positive" as const,
      icon: BarChart3,
    },
    {
      title: "Top Product",
      value: "Rice Basmati",
      change: "45 units sold",
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
    {
      title: "Profit Margin",
      value: "23.5%",
      change: "-2.1% vs last week",
      changeType: "negative" as const,
      icon: TrendingDown,
    }
  ];

  const salesTrend = [
    { day: "Mon", sales: 1200 },
    { day: "Tue", sales: 1800 },
    { day: "Wed", sales: 1400 },
    { day: "Thu", sales: 2100 },
    { day: "Fri", sales: 2800 },
    { day: "Sat", sales: 3200 },
    { day: "Sun", sales: 2400 },
  ];

  const topProducts = [
    { name: "Rice Basmati 1kg", units: 45, revenue: 3825 },
    { name: "Cooking Oil 1L", units: 32, revenue: 3840 },
    { name: "Sugar 1kg", units: 28, revenue: 1260 },
    { name: "Wheat Flour 1kg", units: 25, revenue: 875 },
  ];

  const maxSales = Math.max(...salesTrend.map(item => item.sales));

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze your business performance</p>
        </div>

        {/* Period Selection */}
        <div className="flex gap-2 mb-6">
          {["week", "month", "quarter"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              This {period}
            </Button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {reportStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Sales Chart */}
        <div className="chart-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Sales Trend</h2>
            <BarChart3 size={20} className="text-primary" />
          </div>
          <div className="space-y-3">
            {salesTrend.map((item) => (
              <div key={item.day} className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-8">
                  {item.day}
                </span>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item.sales / maxSales) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-16 text-right">
                  ₹{item.sales.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.units} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-success">₹{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-4">Export Reports</h2>
          <ReportsActions />
        </div>
      </div>
    </div>
  );
}