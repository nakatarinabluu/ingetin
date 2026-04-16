import { 
    ApiResponse,
} from '@ingetin/types';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { PaginatedResponse, FinanceSummaryDTO } from '@ingetin/types';

export interface FinanceProfile {
    monthlyBudgetLimit: number;
    baseSalary?: number;
}
export interface FinanceTransaction {
    id: string;
    amount: number;
    title: string;
    type: 'INCOME' | 'EXPENSE';
    createdAt: string;
}
export type PaginatedFinanceTransactions = PaginatedResponse<FinanceTransaction>;

export const FinanceAPI = {
    getSummary: () => 
        apiClient.get<ApiResponse<FinanceSummaryDTO>>(API_ENDPOINTS.FINANCE.SUMMARY),
    
    updateProfile: (data: { monthlyBudgetLimit?: number; baseSalary?: number }) => 
        apiClient.post<ApiResponse<FinanceProfile>>(API_ENDPOINTS.FINANCE.PROFILE, data),
    
    getTransactions: (params?: { page: number; limit: number }) =>
        apiClient.get<ApiResponse<PaginatedFinanceTransactions>>(API_ENDPOINTS.FINANCE.TRANSACTIONS, { params }),
};
