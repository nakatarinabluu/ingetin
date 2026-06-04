export const mockAdminDashboard = {
  totalUsers: 1450,
  activeUsers: 1200,
  totalReminders: 85400,
  systemHealth: 99.9,
  revenue: 45000000,
  activeLicenses: 850
};

export const mockProviders = {
  whatsapp: { status: 'ONLINE', latency: 45, load: 30 },
  email: { status: 'ONLINE', latency: 120, load: 15 },
  database: { status: 'STABLE', latency: 10, load: 45 }
};

export const mockPulse = Array.from({ length: 24 }).map((_, i) => ({
  timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
  cpu: Math.random() * 40 + 20,
  memory: Math.random() * 30 + 40,
  requests: Math.floor(Math.random() * 1000 + 500)
}));

export const mockUsersList = Array.from({ length: 15 }).map((_, i) => ({
  id: `usr-${i}`,
  username: `user_${i}`,
  fullName: `User ${i} Fullname`,
  email: `user${i}@example.com`,
  phoneNumber: `628123456789${i}`,
  isActivated: true,
  role: "USER",
  createdAt: new Date().toISOString()
}));

export const mockLicensesList = Array.from({ length: 15 }).map((_, i) => ({
  id: `lic-${i}`,
  key: `INGETIN-KEY-${1000 + i}`,
  type: "PREMIUM",
  status: i % 5 === 0 ? "EXPIRED" : "ACTIVE",
  ownerId: `usr-${i}`,
  validUntil: new Date(Date.now() + 86400000 * 30).toISOString()
}));

export const mockTrafficChartData = [
  { name: 'Sen', sent: 1200, received: 300 },
  { name: 'Sel', sent: 1350, received: 450 },
  { name: 'Rab', sent: 1010, received: 200 },
  { name: 'Kam', sent: 1450, received: 500 },
  { name: 'Jum', sent: 1900, received: 600 },
  { name: 'Sab', sent: 2100, received: 800 },
  { name: 'Min', sent: 2500, received: 1200 },
];
