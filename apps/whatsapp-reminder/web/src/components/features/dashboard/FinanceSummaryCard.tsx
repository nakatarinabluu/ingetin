import React from 'react';
import { Wallet, TrendingUp, BarChart3, ChevronRight, Activity, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '../../ui/Typography';
import { DASHBOARD_COPY, COMMON_COPY } from '../../../constants/copy';
import { SLIDE_UP, FADE_IN } from '../../../utils/motion';
import { cn } from '../../../utils/tw.utils';

interface FinanceSummaryData {
  remainingBudget: number;
  expensePercentage: number;
  totalExpense: number;
  dailyEstimation: number;
}

interface FinanceSummaryCardProps {
  data: FinanceSummaryData | null;
  isLoading: boolean;
}

/**
 * 🚀 THE MODERN PRO FINANCE SUMMARY - v9.0
 * Financial Intelligence & Budget Protocol.
 */
export const FinanceSummaryCard: React.FC<FinanceSummaryCardProps> = ({ data, isLoading }) => {
  const remainingBudgetFormatted = data?.remainingBudget?.toLocaleString('id-ID') || "0";
  const expensePercentage = data?.expensePercentage || 0;

  return (
    <div className="flex-1 w-full text-left">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" {...FADE_IN} className="w-full">
            <div className="w-full min-h-[250px] bg-secondary/50 animate-pulse rounded-2xl border border-border/60" />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="w-full h-full flex flex-col justify-between text-left space-y-8">
              
              {/* 01. PRIMARY METRIC: AUTHORITY CAPITALS */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent group cursor-help">
                  <div className="p-2 bg-accent/5 rounded-xl border border-accent/10 shadow-sm transition-all group-hover:bg-accent group-hover:text-white">
                    <Wallet size={16} strokeWidth={2.5} />
                  </div>
                  <Typography variant="small" className="text-accent font-bold tracking-[0.2em] text-[9px] uppercase">Likuiditas Operasional</Typography>
                </div>
                <div className="space-y-2">
                  <Typography variant="h1" className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-none">
                    Rp {remainingBudgetFormatted}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Activity size={10} className="text-muted-foreground/30" />
                    <Typography variant="p" className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">Anggaran Tersisa • Estimasi Bulanan</Typography>
                  </div>
                </div>
              </div>

              {/* 02. INSIGHT GRID: SYSTEM ANALYTICS */}
              <div className="grid grid-cols-2 gap-4">
                <InsightItem 
                  icon={<PieChart size={14} strokeWidth={2.5} />} 
                  label="Total Terpakai" 
                  value={`Rp ${data?.totalExpense?.toLocaleString('id-ID') || "0"}`}
                />
                <InsightItem 
                  icon={<TrendingUp size={14} strokeWidth={2.5} />} 
                  label="Alokasi Harian" 
                  value={`Rp ${data?.dailyEstimation?.toLocaleString('id-ID') || "0"}`}
                />
              </div>

              {/* 03. PROGRESS PROTOCOL: RESOURCE UTILIZATION */}
              <div className="space-y-5 pt-8 border-t border-border/80">
                <div className="flex justify-between items-end">
                  <div className="space-y-1.5 text-left">
                    <Typography variant="small" className="text-muted-foreground/40 font-bold uppercase tracking-widest text-[8px] leading-none">Pemanfaatan Kapasitas Dana</Typography>
                    <div className="flex items-baseline gap-2">
                        <span className={cn(
                            "text-2xl font-bold tracking-tighter tabular-nums",
                            expensePercentage > 85 ? "text-destructive" : "text-primary"
                        )}>
                            {expensePercentage}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/20">Otorisasi</span>
                    </div>
                  </div>
                  <Link to="/finances" className="group flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-accent/40 shadow-modern transition-all active:scale-95">
                    <Typography variant="small" className="text-[10px] font-bold text-white uppercase tracking-widest">Analitik</Typography>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/20 shadow-inner group p-0.5 flex items-center">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${expensePercentage}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn(
                        "h-2 rounded-full transition-all relative overflow-hidden",
                        expensePercentage > 85 ? "bg-destructive" : "bg-accent"
                    )}
                  >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
                <div className="flex justify-between">
                    <Typography variant="small" className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Protocol Nominal</Typography>
                    <Typography variant="small" className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Threshold Limit</Typography>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function InsightItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-2 text-left group border border-border/80 p-4 rounded-xl hover:bg-white hover:border-accent/30 hover:shadow-subtle transition-all duration-300">
      <div className="flex items-center gap-2.5 text-muted-foreground/30 group-hover:text-accent transition-colors">
        {icon}
        <Typography variant="small" className="font-bold uppercase tracking-[0.15em] text-[8px]">{label}</Typography>
      </div>
      <Typography variant="h4" className="text-sm font-bold tracking-tight text-foreground tabular-nums">{value}</Typography>
    </div>
  );
}
