import { 
    LoginInput, 
    RegisterInput, 
    UpdateProfileInput, 
    ActivateLicenseInput,
    ApiResponse,
    UserDTO,
    AuthResult
} from '@ingetin/types';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const AuthAPI = {
    checkUsername: (username: string) => 
        apiClient.get<ApiResponse<{ available: boolean }>>(API_ENDPOINTS.AUTH.CHECK_USERNAME, { params: { username } }),
    
    login: (data: LoginInput) => 
        apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.LOGIN, data),
    
    register: (data: RegisterInput) => 
        apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.REGISTER, data),
    
    activate: (data: ActivateLicenseInput) => 
        apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.ACTIVATE, data),
    
    updateProfile: (data: UpdateProfileInput) => 
        apiClient.post<ApiResponse<UserDTO>>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
    
    unlinkGoogle: () => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.AUTH.UNLINK_GOOGLE),
    
    unlinkPhone: () => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.AUTH.UNLINK_PHONE),
};
