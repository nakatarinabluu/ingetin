import { motion } from 'framer-motion';
import { Card } from '@/shared/ui/Card';
import { TransactionHistory } from '../ui/TransactionHistory';
import { FinanceTransactionDTO } from '@ingetin/types';

interface TransactionsTabProps {
    transactions: FinanceTransactionDTO[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
    // Map FinanceTransactionDTO → format expected by TransactionHistory
    const mapped = transactions.map((t) => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        date: new Date(t.date).toISOString(),
        category: t.category ?? 'Umum',
        type: t.type,
        status: 'SUCCESS' as const,
    }));

    return (
        <motion.div
            key="log"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card className="rounded-2xl border-wa-border shadow-wa bg-white overflow-hidden p-5 md:p-8 text-left">
                <TransactionHistory transactions={mapped} hideFilter={true} />
            </Card>
        </motion.div>
    );
}
