"use client";

// Keep Lucide behind the client boundary. Its IconContext calls React.createContext
// at module load, which the React Server Component runtime does not expose.
export {
  Banknote,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  ClipboardList,
  HandCoins,
  LogOut,
  PlayCircle,
  Plus,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
