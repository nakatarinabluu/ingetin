import { useQuery } from '@tanstack/react-query';
import { FinanceAPI } from '../api/finance.api';

export const useFinanceSummary = () => {
    return useQuery({
        queryKey: ['finance-summary'],
        queryFn: async () => {
            const res = await FinanceAPI.getSummary();
            return res.data.data;
        },
        staleTime: 60000,
    });
};

export const useFinanceHistory = (params: { page: number; limit: number }) => {
    return useQuery({
        queryKey: ['finance-history', params],
        queryFn: async () => {
            const res = await FinanceAPI.getTransactions(params);
            return res.data.data;
        },
        staleTime: 30000,
    });
};
