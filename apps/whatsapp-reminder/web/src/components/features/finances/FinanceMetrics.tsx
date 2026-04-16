import { motion } from 'framer-motion';
import { FinanceSummary } from '../../../types';
import { FINANCE_COPY } from '../../../constants/copy';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity 
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Typography } from '../../ui/Typography';
import { cn } from '../../../utils/tw.utils';

interface MetricProps {
  title: string;
  value: string;
  subValue: string;
  type: 'success' | 'danger' | 'primary';
  icon: React.ReactNode;
  delay?: number;
}

/**
 * 🚀 THE MODERN PRO FINANCE METRICS - v9.0
 * Performance Metrology & Capital Dashboard.
 */
export const FinanceMetrics: React.FC<{ data: FinanceSummary | null; isLoading: boolean }> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-secondary/50 animate-pulse border border-border/60 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard 
        title={FINANCE_COPY.metrics.income_title} 
        value={`Rp ${data?.totalIncome?.toLocaleString('id-ID') || "0"}`} 
        subValue={FINANCE_COPY.metrics.income_sub} 
        type="success"
        icon={<TrendingUp size={20} strokeWidth={2.5} />}
        delay={0.1}
      />
      <MetricCard 
        title={FINANCE_COPY.metrics.expense_title} 
        value={`Rp ${data?.totalExpense?.toLocaleString('id-ID') || "0"}`} 
        subValue={FINANCE_COPY.metrics.expense_sub} 
        type="danger"
        icon={<TrendingDown size={20} strokeWidth={2.5} />}
        delay={0.2}
      />
      <MetricCard 
        title={FINANCE_COPY.metrics.balance_title} 
        value={`Rp ${((data?.totalIncome || 0) - (data?.totalExpense || 0)).toLocaleString('id-ID')}`} 
        subValue={FINANCE_COPY.metrics.balance_sub} 
        type="primary"
        icon={<Zap size={20} strokeWidth={2.5} />}
        delay={0.3}
      />
    </div>
  );
};

function MetricCard({ title, value, subValue, type, icon, delay = 0 }: MetricProps) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="text-left"
    >
        <Card className="shadow-subtle border border-border/80 p-6 md:p-8 space-y-6 hover:border-accent/40 hover:shadow-modern transition-all duration-500 cursor-default bg-white rounded-[2rem] group relative overflow-hidden">
            {/* Background Accent */}
            <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-opacity duration-700 group-hover:opacity-20",
                type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-destructive' : 'bg-accent'
            )} />

            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <Typography variant="small" className="font-bold tracking-[0.2em] text-[8px] text-muted-foreground/30 uppercase leading-none">
                        {title}
                    </Typography>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                        <div className={cn("w-1 h-1 rounded-full", type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-destructive' : 'bg-accent')} />
                        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Real-time Metric</span>
                    </div>
                </div>
                <div className={cn(
                    "p-3 rounded-xl transition-all duration-500 border shadow-sm group-hover:scale-110 group-hover:rotate-3",
                    type === 'success' ? 'bg-success/5 text-success border-success/10 group-hover:bg-success group-hover:text-white' : 
                    type === 'danger' ? 'bg-destructive/5 text-destructive border-destructive/10 group-hover:bg-destructive group-hover:text-white' : 
                    'bg-slate-950 text-white border-slate-800 group-hover:bg-accent'
                )}>
                    {icon}
                </div>
            </div>
            
            <div className="space-y-2 relative z-10">
                <Typography variant="h3" className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground tabular-nums group-hover:text-accent transition-colors duration-500">
                {value}
                </Typography>
                <div className="flex items-center gap-2 pt-1">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                        activeStyle(type)
                    )}>
                        {type === 'success' ? <ArrowUpRight size={10} strokeWidth={3} /> : type === 'danger' ? <ArrowDownRight size={10} strokeWidth={3} /> : <Activity size={10} strokeWidth={3} />}
                        {subValue}
                    </div>
                </div>
            </div>
        </Card>
    </motion.div>
  );
}

function activeStyle(type: string) {
    if (type === 'success') return 'bg-success/5 text-success border-success/10 group-hover:bg-success group-hover:text-white';
    if (type === 'danger') return 'bg-destructive/5 text-destructive border-destructive/10 group-hover:bg-destructive group-hover:text-white';
    return 'bg-secondary text-muted-foreground/60 border-border group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-800';
}
