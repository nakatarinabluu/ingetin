import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell as ReCell
} from 'recharts';
/**
 * 🚀 THE MODREN PRO FINANCE CHARTS - v9.0 "Cloud Analytics"
 */
export const FinanceCharts: React.FC<FinanceChartsProps> = ({ data, loading }) => {
  
  const chartData = data?.dailyStats || [
    { name: 'SEN', amount: 0 },
    { name: 'SEL', amount: 0 },
    { name: 'RAB', amount: 0 },
    { name: 'KAM', amount: 0 },
    { name: 'JUM', amount: 0 },
    { name: 'SAB', amount: 0 },
    { name: 'MIN', amount: 0 },
  ];

  const categories = data?.categories || [
    { name: 'GENERAL', amount: 1, color: 'var(--accent)' }
  ];

  if (loading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="h-[450px] bg-gray-50/50 animate-pulse rounded-[2.5rem] border border-gray-100" />
            <div className="h-[450px] bg-gray-50/50 animate-pulse rounded-[2.5rem] border border-gray-100" />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">

      {/* 1. AREA CHART - TREND DEPLOYMENT */}
      <section className="lg:col-span-8 space-y-8">
        <Card className="p-10 border border-gray-100/60 shadow-modern bg-white rounded-[2.5rem] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-50 relative z-10">
                <div className="flex items-center gap-4 text-accent">
                    <Activity size={22} strokeWidth={2.5} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">TELEMETRY_STREAM // WEEKLY_TREND</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 text-accent border border-accent/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">LIVE_FEED</span>
                </div>
            </div>

            <div className="h-[320px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                            dy={15}
                        />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '20px', 
                                border: 'none', 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                fontSize: '11px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                fontStyle: 'italic',
                                padding: '15px'
                            }} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="var(--accent)" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorAmount)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </section>

      {/* 2. PIE CHART - SECTOR ALLOCATION */}
      <section className="lg:col-span-4 space-y-8">
        <Card className="p-10 border border-gray-100/60 shadow-modern bg-white rounded-[2.5rem] h-full flex flex-col group overflow-hidden relative">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-vibrant-rose/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-12 pb-6 border-b border-gray-50 relative z-10">
                <ShieldCheck size={22} strokeWidth={2.5} className="text-accent" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">SECTOR_MAP // AUDIT</span>
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
                <div className="h-[220px] w-full relative mb-12 group/pie">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie 
                                data={categories} 
                                innerRadius={70} 
                                outerRadius={100} 
                                paddingAngle={8} 
                                dataKey="amount" 
                                nameKey="name"
                                stroke="none"
                            >
                                {categories.map((entry: CategoryEntry, index: number) => (
                                    <ReCell 
                                        key={`cell-${index}`} 
                                        fill={index === 0 ? 'var(--accent)' : index === 1 ? 'var(--vibrant-emerald)' : 'var(--vibrant-violet)'} 
                                    />
                                ))}
                            </Pie>
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover/pie:scale-110 transition-transform duration-500">
                        <span className="text-[26px] font-black text-[#111b21] italic tracking-tighter leading-none">100%</span>
                        <span className="text-[9px] font-black text-success uppercase tracking-[0.3em] mt-1">VERIFIED</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {categories.slice(0, 3).map((cat: CategoryEntry, i: number) => (
                        <div key={i} className="flex items-center justify-between group/row">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full group-hover/row:scale-125 transition-transform" 
                                    style={{ backgroundColor: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--vibrant-emerald)' : 'var(--vibrant-violet)' }} 
                                />
                                <span className="text-[13px] font-bold text-gray-500 uppercase italic tracking-tight">{cat.name}</span>
                            </div>
                            <span className="text-[13px] font-black text-[#111b21] tracking-tighter italic">{cat.amount}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
      </section>
    </div>
  );
};
