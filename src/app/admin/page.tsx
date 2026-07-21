"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const currency = stats?.currencySymbol || "£";

  const formatTrend = (value: number | undefined) => {
    if (value === undefined) return "—";
    return `${value >= 0 ? "+" : ""}${value}%`;
  };

  const statCards = [
    { name: "Total Revenue", value: `${currency}${stats?.totalRevenue?.toLocaleString()}`, icon: DollarSign, trend: formatTrend(stats?.trends?.revenue), positive: (stats?.trends?.revenue ?? 0) >= 0, color: "bg-emerald-100 text-emerald-600" },
    { name: "Appointments", value: stats?.appointmentCount?.toString(), icon: Calendar, trend: formatTrend(stats?.trends?.appointments), positive: (stats?.trends?.appointments ?? 0) >= 0, color: "bg-brand-secondary/50 text-brand-primary" },
    { name: "New Clients", value: stats?.newClientsCount?.toString(), icon: Users, trend: formatTrend(stats?.trends?.newClients), positive: (stats?.trends?.newClients ?? 0) >= 0, color: "bg-brand-accent/20 text-brand-accent" },
  ];

  const monthlyRevenue: { label: string; revenue: number }[] = stats?.monthlyRevenue || [];
  const maxMonthlyRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-serif text-brand-primary">Studio Pulse</h3>
        <p className="text-zinc-500">A snapshot of your business performance this month.</p>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-brand-primary p-2 rounded-[2rem] shadow-xl flex flex-wrap gap-2">
        <button 
          onClick={() => window.location.href = '/admin/appointments'}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Schedule Session
        </button>
        <button 
          onClick={() => window.location.href = '/admin/inventory'}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> Restock Supplies
        </button>
        <button 
          onClick={() => window.location.href = '/admin/portfolio'}
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4" /> Update Showcase
        </button>
      </div>

      {/* System Alerts */}
      {(stats?.alerts?.lowStock > 0 || stats?.alerts?.pendingAppointments > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.alerts.pendingAppointments > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{stats.alerts.pendingAppointments} Pending Appointments</p>
                <p className="text-xs opacity-80">Requires confirmation or rescheduling.</p>
              </div>
              <button 
                onClick={() => window.location.href = '/admin/appointments'}
                className="ml-auto text-xs font-bold underline"
              >
                Review
              </button>
            </div>
          )}
          {stats.alerts.lowStock > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-800">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{stats.alerts.lowStock} Low Stock Items</p>
                <p className="text-xs opacity-80">Supplies are below their minimum threshold.</p>
              </div>
              <button 
                onClick={() => window.location.href = '/admin/inventory'}
                className="ml-auto text-xs font-bold underline"
              >
                Restock
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 font-bold text-xs ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <ArrowUpRight className={`w-3 h-3 ${stat.positive ? '' : 'rotate-90'}`} />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold">Revenue Growth</h4>
            <span className="bg-zinc-50 text-xs font-bold rounded-lg px-3 py-2 text-zinc-500">Last 6 Months</span>
          </div>
          {monthlyRevenue.length > 0 ? (
            <>
              <div className="flex items-end gap-3 h-48 px-2">
                {monthlyRevenue.map((month, i) => {
                  const heightPct = Math.max(4, Math.round((month.revenue / maxMonthlyRevenue) * 100));
                  return (
                    <div key={i} className="flex-1 group relative">
                      <div
                        className="w-full bg-brand-primary/10 rounded-t-xl group-hover:bg-brand-primary transition-all duration-500 cursor-pointer"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {currency}{month.revenue.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {monthlyRevenue.map((month, i) => <span key={i}>{month.label}</span>)}
              </div>
            </>
          ) : (
            <p className="text-center text-zinc-400 py-16">No revenue data yet.</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
           <h4 className="text-xl font-bold mb-8">Popular Services</h4>
           <div className="space-y-6">
              {stats?.popularServices?.length > 0 ? stats.popularServices.map((service: any) => (
                <div key={service.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-zinc-700">{service.name}</span>
                    <span className="font-bold">{service.share}%</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-50 rounded-full overflow-hidden">
                    <div className={`h-full ${service.color}`} style={{ width: `${service.share}%` }} />
                  </div>
                </div>
              )) : (
                <p className="text-center text-zinc-400 py-8">No booking data available yet.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
