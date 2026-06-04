import { useQuery } from '@tanstack/react-query';
import { FinanceAPI } from '@/entities/finance/api';
import { unwrap } from '@/shared/lib/api.utils';

export const useFinanceSummary = () => {
    return useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => {
            const res = await FinanceAPI.getSummary();
            return unwrap(res.data);
        },
        staleTime: 60000,
    });
};

export const useFinanceHistory = (params: { page: number; limit: number; month?: string; year?: string }) => {
    return useQuery({
        queryKey: ['finance-history', params],
        queryFn: async () => {
            const res = await FinanceAPI.getTransactions(params);
            return unwrap(res.data);
        },
        staleTime: 30000,
    });
}
