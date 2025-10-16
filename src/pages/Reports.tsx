import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { ReportsActions } from "@/components/ReportsActions";
import { useSales } from "@/hooks/useSales";
import { useInventory } from "@/hooks/useInventory";
import { useCustomers } from "@/hooks/useCustomers";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { invoices, todaysRevenue, todaysInvoices } = useSales();
  const { stockSummary } = useInventory();
  const { customers } = useCustomers();

  // Calculate report stats from real data
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const lowStockCount = stockSummary.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = stockSummary.filter(item => item.status === 'out_of_stock').length;
  
  // Get top selling product
  const productSales = new Map<string, { name: string; units: number }>();
  invoices.forEach(inv => {
    inv.invoice_items?.forEach(item => {
      const productId = item.product_id;
      const productName = item.products?.name || "Unknown";
      const current = productSales.get(productId) || { name: productName, units: 0 };
      productSales.set(productId, { name: productName, units: current.units + item.quantity });
    });
  });
  
  const topProduct = Array.from(productSales.values())
    .sort((a, b) => b.units - a.units)[0] || { name: "N/A", units: 0 };

  const reportStats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: `${invoices.length} invoices`,
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Total Orders",
      value: invoices.length.toString(),
      change: `${todaysInvoices.length} today`,
      changeType: "positive" as const,
      icon: BarChart3,
    },
    {
      title: "Top Product",
      value: topProduct.name,
      change: `${topProduct.units} units sold`,
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
    {
      title: "Stock Alerts",
      value: (lowStockCount + outOfStockCount).toString(),
      change: `${outOfStockCount} out of stock`,
      changeType: outOfStockCount > 0 ? "negative" as const : "positive" as const,
      icon: TrendingDown,
    }
  ];

  // Get recent sales trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const salesTrend = last7Days.map(date => {
    const dayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at);
      return invDate.toDateString() === date.toDateString();
    });
    const daySales = dayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sales: daySales
    };
  });

  // Get top products by revenue
  const productRevenue = new Map<string, { name: string; units: number; revenue: number }>();
  invoices.forEach(inv => {
    inv.invoice_items?.forEach(item => {
      const productId = item.product_id;
      const productName = item.products?.name || "Unknown";
      const current = productRevenue.get(productId) || { name: productName, units: 0, revenue: 0 };
      productRevenue.set(productId, {
        name: productName,
        units: current.units + item.quantity,
        revenue: current.revenue + item.line_total
      });
    });
  });

  const topProducts = Array.from(productRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

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