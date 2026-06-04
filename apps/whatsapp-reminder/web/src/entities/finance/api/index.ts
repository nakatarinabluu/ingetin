import { 
    ApiResponse,
} from '@ingetin/types';
import apiClient from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { PaginatedResponse, FinanceSummaryDTO, FinanceTransactionDTO } from '@ingetin/types';

export interface FinanceProfile {
    monthlyBudgetLimit: number;
    baseSalary?: number;
}
export type PaginatedFinanceTransactions = PaginatedResponse<FinanceTransactionDTO>;

export const FinanceAPI = {
    getSummary: () => 
        apiClient.get<ApiResponse<FinanceSummaryDTO>>(API_ENDPOINTS.FINANCE.SUMMARY),
    
    updateProfile: (data: { monthlyBudgetLimit?: number; baseSalary?: number }) => 
        apiClient.post<ApiResponse<FinanceProfile>>(API_ENDPOINTS.FINANCE.PROFILE, data),
    
    getTransactions: (params?: { page: number; limit: number; month?: string; year?: string }) =>
        apiClient.get<ApiResponse<PaginatedFinanceTransactions>>(API_ENDPOINTS.FINANCE.TRANSACTIONS, { params }),
};
