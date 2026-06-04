export const mockProfile = {
  id: "mock-user-123",
  username: "budisatria",
  firstName: "Budi",
  lastName: "Satria",
  fullName: "Budi Satria",
  email: "budi@email.com",
  phoneNumber: "6281234567890",
  isActivated: true,
  role: "USER"
};

export const mockFinanceSummary = {
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
  weeklyStats: [
    { name: 'Mg. 1', amount: 2400000 },
    { name: 'Mg. 2', amount: 3750000 },
    { name: 'Mg. 3', amount: 2100000 },
    { name: 'Mg. 4', amount: 4200000 }
  ],
  monthlyStats: [
    { name: 'Mei', amount: 8000000 },
    { name: 'Jun', amount: 10500000 },
    { name: 'Jul', amount: 9200000 },
    { name: 'Agu', amount: 11000000 },
    { name: 'Sep', amount: 8500000 },
    { name: 'Okt', amount: 12000000 },
    { name: 'Nov', amount: 13500000 },
    { name: 'Des', amount: 9500000 },
    { name: 'Jan', amount: 14000000 },
    { name: 'Feb', amount: 10800000 },
    { name: 'Mar', amount: 11500000 },
    { name: 'Apr', amount: 12450000 }
  ],
  categories: [
    { name: 'Makanan', amount: 35, color: '#00a884' },
    { name: 'Transportasi', amount: 25, color: '#25D366' },
    { name: 'Cicilan', amount: 20, color: '#111b21' },
    { name: 'Hiburan', amount: 20, color: '#54656f' },
  ]
};

export const mockTransactions = Array.from({ length: 40 }).map((_, i) => {
  const month = i < 12 ? '04' : i < 26 ? '03' : '02';
  const day = (28 - (i % 25)).toString().padStart(2, '0');
  return {
      id: `tx-${i}`,
      title: i % 3 === 0 ? "Makan Siang" : i % 4 === 0 ? "Gaji Bulanan" : "Pembayaran Internet",
      amount: i % 4 === 0 ? 5000000 : i % 3 === 0 ? 50000 : 150000,
      type: i % 4 === 0 ? 'INCOME' : 'EXPENSE',
      category: i % 4 === 0 ? 'Gaji' : 'Kebutuhan',
      date: `2026-${month}-${day}`,
      status: 'SUCCESS'
  };
});

const reminderTitles = ["Rapat Koordinasi", "Minum Obat", "Bayar Tagihan Listrik", "Jemput Anak Sekolah", "Workout Sore", "Beli Susu", "Laporan Mingguan", "Service Kendaraan", "Ultah Teman", "Telepon Orang Tua"];
export const mockReminders = Array.from({ length: 60 }).map((_, i) => {
  const isPast = i > 10;
  const scheduleDate = isPast 
      ? new Date(Date.now() - (i * 3600000 * 2)) // Past
      : new Date(Date.now() + (i * 3600000));   // Future
  
  return {
    id: `rem-${i}`,
    title: reminderTitles[i % reminderTitles.length],
    message: `Pesan pengingat otomatis untuk ${reminderTitles[i % reminderTitles.length]}. Jangan lupa dikerjakan tepat waktu!`,
    schedule: scheduleDate.toISOString(),
    targetDate: scheduleDate.toISOString(), 
    status: i % 15 === 0 ? "FAILED" : isPast ? "SENT" : "PENDING",
    repeat: "ONCE"
  };
});

// Front-end pure mocks (untuk UserFinances.tsx)
export const mockBudgetCategories = [
  { id: 1, category: 'Makanan & Minuman', limit: 2000000, spent: 1200000, icon: 'Utensils' },
  { id: 2, category: 'Transportasi', limit: 1000000, spent: 450000, icon: 'CarFront' },
  { id: 3, category: 'Hiburan', limit: 500000, spent: 600000, icon: 'Film' },
  { id: 4, category: 'Belanja', limit: 1500000, spent: 800000, icon: 'ShoppingBag' },
];

export const mockSubscriptions = [
  { id: 1, name: 'Netflix Premium', amount: 186000, date: '12', icon: 'MonitorPlay', category: 'Hiburan' },
  { id: 2, name: 'Internet (Indihome)', amount: 450000, date: '05', icon: 'Wifi', category: 'Kebutuhan' },
  { id: 3, name: 'Spotify Family', amount: 86000, date: '20', icon: 'Music', category: 'Hiburan' },
];

export const mockDebts = [
  { id: 1, name: 'Andi Pratama', amount: 150000, type: 'PIUTANG', note: 'Makan siang bareng', date: '2026-04-10' },
  { id: 2, name: 'Budi (Rental)', amount: 500000, type: 'HUTANG', note: 'Pinjam buat bensin', date: '2026-04-12' },
];
