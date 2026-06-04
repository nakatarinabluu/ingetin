import React, { useState } from 'react';
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
  Cell as ReCell,
  ReferenceLine
} from 'recharts';
import { Card } from '@/shared/ui/Card';
import { TrendingUp, PieChart } from 'lucide-react';
import { FinanceSummaryDTO } from '@ingetin/types';

interface CategoryEntry {
    name: string;
    amount: number;
    color?: string;
}

interface FinanceChartsProps {
    data: FinanceSummaryDTO | undefined;
    loading: boolean;
    budgetLimit?: number;
    hideScale?: boolean;
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ data, loading, budgetLimit, hideScale }) => {
  const [timeRange, setTimeRange] = useState<'daily'|'weekly'>('daily');
  
  const dailyData = data?.dailyStats || [
    { name: 'SEN', amount: 0 },
    { name: 'SEL', amount: 0 },
    { name: 'RAB', amount: 0 },
    { name: 'KAM', amount: 0 },
    { name: 'JUM', amount: 0 },
    { name: 'SAB', amount: 0 },
    { name: 'MIN', amount: 0 },
  ];

  const weeklyData = data?.weeklyStats || [];

  const chartData = timeRange === 'daily' ? dailyData : weeklyData;

  const categories = data?.categories || [
    { name: 'UMUM', amount: 100, color: '#00a884' }
  ];

  if (loading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 h-[400px] bg-wa-bg animate-pulse rounded-2xl border border-wa-border" />
            <div className="lg:col-span-4 h-[400px] bg-wa-bg animate-pulse rounded-2xl border border-wa-border" />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">

      {/* 1. AREA CHART - WEEKLY */}
      <section className="lg:col-span-8 text-left">
        <Card className="p-5 md:p-6 border border-wa-border shadow-none bg-white rounded-2xl h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-wa-green/8 flex items-center justify-center text-wa-green">
                        <TrendingUp size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[16px] font-bold text-wa-dark">Statistik Keuangan</span>
                        <p className="text-xs text-wa-icon mt-0.5">
                            Riwayat {timeRange === 'daily' ? '7 hari' : '4 minggu'} terakhir
                        </p>
                    </div>
                </div>
                {!hideScale && (
                    <div className="flex items-center p-1 bg-wa-bg rounded-lg border border-wa-border overflow-x-auto">
                        <button 
                            onClick={() => setTimeRange('daily')}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${timeRange === 'daily' ? "bg-white text-wa-dark shadow-sm" : "text-wa-icon hover:text-wa-dark"}`}
                        >
                            Harian
                        </button>
                        <button 
                            onClick={() => setTimeRange('weekly')}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${timeRange === 'weekly' ? "bg-white text-wa-dark shadow-sm" : "text-wa-icon hover:text-wa-dark"}`}
                        >
                            Mingguan
                        </button>
                    </div>
                )}
            </div>

            <div className="h-[280px] w-full mt-auto min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmountWA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a884" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edef" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#667781', fontSize: 12, fontWeight: 500 }} 
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #e9edef', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#111b21',
                                padding: '12px'
                            }} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#00a884" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAmountWA)" 
                            animationDuration={1000}
                        />
                        {budgetLimit && (
                            <ReferenceLine 
                                y={budgetLimit} 
                                stroke="#f97316" 
                                strokeDasharray="3 3" 
                                strokeWidth={2}
                                label={{ position: 'insideTopLeft', value: 'Batas Max', fill: '#f97316', fontSize: 11, fontWeight: 'bold' }} 
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </section>

      {/* 2. PIE CHART - CATEGORIES */}
      <section className="lg:col-span-4 text-left">
        <Card className="p-5 md:p-6 border border-wa-border shadow-none bg-white rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-wa-green/8 flex items-center justify-center text-wa-green">
                    <PieChart size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[16px] font-bold text-wa-dark">Alokasi Kas</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="h-[200px] w-full relative mb-6 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                        <RePieChart>
                            <Pie 
                                data={categories} 
                                innerRadius={65} 
                                outerRadius={90} 
                                paddingAngle={4} 
                                dataKey="amount" 
                                nameKey="name"
                                stroke="none"
                            >
                                {categories.map((_: CategoryEntry, index: number) => (
                                    <ReCell 
                                        key={`cell-${index}`} 
                                        fill={index === 0 ? '#00a884' : index === 1 ? '#128C7E' : '#25D366'} 
                                    />
                                ))}
                            </Pie>
                        </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-wa-dark">100%</span>
                        <span className="text-[11px] font-semibold text-wa-icon mt-0.5">TERCATAT</span>
                    </div>
                </div>

                <div className="space-y-3 px-2">
                    {categories.slice(0, 3).map((cat: CategoryEntry, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: i === 0 ? '#00a884' : i === 1 ? '#128C7E' : '#25D366' }} 
                                />
                                <span className="text-sm font-medium text-wa-icon capitalize">{cat.name.toLowerCase()}</span>
                            </div>
                            <span className="text-sm font-semibold text-wa-dark">{cat.amount}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
      </section>
    </div>
  );
};
