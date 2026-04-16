import MockAdapter from "axios-mock-adapter";
import { AxiosInstance } from "axios";

/**
 * 🧸 INGETIN MOCK SYSTEM (v2.0 - ACTIVE USER SCENARIO)
 * Scenario: "The Super User - Budi Satria"
 * Purpose: Simulating hundreds of records to test UI performance and layout.
 */
export const setupMocks = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

  console.log("🛠️ INGETIN: High-Activity Simulation Mode is ACTIVE.");

  // --- 1. AUTH FLOW ---
  mock.onPost(/\/auth\/login/).reply(200, {
    success: true,
    data: {
      token: "mock-jwt-token",
      user: { id: "user-1", username: "budisatria", role: "USER", isActivated: true }
    }
  });

  // --- 2. PROFILE ---
  mock.onGet(/profile/).reply(200, {
    success: true,
    data: {
      id: "mock-user-123",
      username: "budisatria",
      firstName: "Budi",
      lastName: "Satria",
      email: "budi@email.com",
      phoneNumber: "6281234567890",
      isActivated: true,
      role: "USER"
    }
  });

  // --- 3. FINANCES ---
  mock.onGet(/finances\/summary/).reply(200, {
    success: true,
    data: {
      totalIncome: 15000000,
      totalExpense: 12450000,
      monthlyBudgetLimit: 15000000,
      remainingBudget: 2550000,
      balance: 2550000,
      expensePercentage: 83,
      status: "STABLE",
      dailyStats: [
        { name: 'Sen', amount: 450000 },
        { name: 'Sel', amount: 1200000 },
        { name: 'Rab', amount: 800000 },
        { name: 'Kam', amount: 2100000 },
        { name: 'Jum', amount: 1500000 },
        { name: 'Sab', amount: 3200000 },
        { name: 'Min', amount: 900000 },
      ],
      categories: [
        { name: 'Makanan', amount: 35, color: '#00a884' },
        { name: 'Transportasi', amount: 25, color: '#25D366' },
        { name: 'Cicilan', amount: 20, color: '#111b21' },
        { name: 'Hiburan', amount: 20, color: '#54656f' },
      ]
    }
  });

  // Generate 40 Finance Transactions
  const mockTransactions = Array.from({ length: 40 }).map((_, i) => ({
    id: `tx-${i}`,
    title: i % 3 === 0 ? "Makan Siang" : i % 4 === 0 ? "Gaji Bulanan" : "Pembayaran Internet",
    amount: i % 4 === 0 ? 5000000 : i % 3 === 0 ? 50000 : 150000,
    type: i % 4 === 0 ? 'INCOME' : 'EXPENSE',
    category: i % 4 === 0 ? 'Gaji' : 'Kebutuhan',
    date: `2026-04-${(16 - (i % 15)).toString().padStart(2, '0')}`,
    status: 'SUCCESS'
  }));

  mock.onGet(/finances\/transactions/).reply(200, {
    success: true,
    data: {
      items: mockTransactions,
      pagination: { total: 40, page: 1, limit: 10, totalPages: 4 }
    }
  });

  // --- 4. REMINDERS ---
  // Generate 60 Reminders
  const reminderTitles = ["Rapat Koordinasi", "Minum Obat", "Bayar Tagihan Listrik", "Jemput Anak Sekolah", "Workout Sore", "Beli Susu", "Laporan Mingguan", "Service Kendaraan", "Ultah Teman", "Telepon Orang Tua"];
  const mockReminders = Array.from({ length: 60 }).map((_, i) => {
    const isPast = i > 10;
    const scheduleDate = isPast 
        ? new Date(Date.now() - (i * 3600000 * 2)) // Past
        : new Date(Date.now() + (i * 3600000));   // Future
    
    return {
      id: `rem-${i}`,
      title: reminderTitles[i % reminderTitles.length],
      message: `Pesan pengingat otomatis untuk ${reminderTitles[i % reminderTitles.length]}. Jangan lupa dikerjakan tepat waktu!`,
      schedule: scheduleDate.toISOString(),
      targetDate: scheduleDate.toISOString(), // Standardizing key used in UI
      status: i % 15 === 0 ? "FAILED" : isPast ? "SENT" : "PENDING",
      repeat: "ONCE"
    };
  });

  mock.onGet(/reminders/).reply(200, {
    success: true,
    data: {
      items: mockReminders,
      pagination: { total: 60, page: 1, limit: 10, totalPages: 6 }
    }
  });

  // Safe Guard
  mock.onAny().passThrough();
};
