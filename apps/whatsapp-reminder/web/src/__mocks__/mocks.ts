import MockAdapter from "axios-mock-adapter";
import { AxiosInstance } from "axios";
import { 
  mockProfile, 
  mockFinanceSummary, 
  mockTransactions, 
  mockReminders 
} from "./user.mocks";
import { 
  mockAdminDashboard, 
  mockProviders, 
  mockPulse, 
  mockUsersList, 
  mockLicensesList,
  mockTrafficChartData
} from "./admin.mocks";

/**
 * 🧸 INGETIN MOCK SYSTEM (v1.0)
 * Data di-load dari user.mocks.ts dan admin.mocks.ts
 */
export const setupMocks = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

  // --- 1. AUTH FLOW ---
  mock.onPost(/\/auth\/login/).reply(200, {
    success: true,
    data: {
      token: "mock-jwt-token",
      user: { id: "user-1", username: "budisatria", role: "USER", isActivated: true }
    }
  });

  // --- 2. PROFILE ---
  mock.onGet(/profile/).reply(200, { success: true, data: mockProfile });

  // --- 3. FINANCES ---
  mock.onGet(/finances\/summary/).reply(200, { success: true, data: mockFinanceSummary });
  mock.onGet(/finances\/transactions/).reply(200, {
    success: true,
    data: { items: mockTransactions, pagination: { total: 40, page: 1, limit: 10, totalPages: 4 } }
  });

  // --- 4. REMINDERS ---
  mock.onGet(/reminders/).reply(200, {
    success: true,
    data: { items: mockReminders, pagination: { total: 60, page: 1, limit: 10, totalPages: 6 } }
  });

  // --- 5. ADMIN APIS ---
  mock.onGet(/\/admin\/dashboard/).reply(200, { success: true, data: mockAdminDashboard });
  mock.onGet(/\/admin\/providers/).reply(200, { success: true, data: mockProviders });
  mock.onGet(/\/admin\/pulse/).reply(200, { success: true, data: { pulse: mockPulse } });
  mock.onGet(/\/admin\/traffic/).reply(200, { success: true, data: mockTrafficChartData });
  
  mock.onGet(/\/users/).reply(200, {
    success: true,
    data: { items: mockUsersList, pagination: { total: 15, page: 1, limit: 10, totalPages: 2 } }
  });

  mock.onGet(/\/licenses/).reply(200, {
    success: true,
    data: { items: mockLicensesList, pagination: { total: 15, page: 1, limit: 10, totalPages: 2 } }
  });

  // Safe Guard
  mock.onAny().passThrough();
};
