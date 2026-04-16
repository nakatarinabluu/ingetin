import { 
  LayoutDashboard, 
  CalendarDays, 
  Wallet,
  User,
  Activity,
  Award,
  Users,
  LucideIcon
} from 'lucide-react';
import { DASHBOARD_COPY, ADMIN_COPY } from '../../constants/copy';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const USER_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: DASHBOARD_COPY.sidebar.overview, path: '/dashboard' },
  { icon: CalendarDays, label: DASHBOARD_COPY.sidebar.reminders, path: '/reminders' },
  { icon: Wallet, label: DASHBOARD_COPY.sidebar.finances, path: '/finances' },
  { icon: User, label: DASHBOARD_COPY.sidebar.profile, path: '/profile' },
];

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: Activity, label: ADMIN_COPY.sidebar.monitor, path: '/admin-dashboard' },
  { icon: Users, label: ADMIN_COPY.sidebar.members, path: '/admin-users' },
  { icon: Award, label: ADMIN_COPY.sidebar.license, path: '/admin-license' },
  { icon: User, label: ADMIN_COPY.sidebar.profile, path: '/admin-profile' },
];
