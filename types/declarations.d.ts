declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Wrench: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const PhoneCall: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Search: LucideIcon;
  export const MapPin: LucideIcon;
  export const Star: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Clock: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Zap: LucideIcon;
  export const Users: LucideIcon;
  export const Award: LucideIcon;
  export const Radio: LucideIcon;
  export const Phone: LucideIcon;
  export const Layers: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Activity: LucideIcon;
  export const Network: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Server: LucideIcon;
  export const Camera: LucideIcon;
  export const Cpu: LucideIcon;
  export const Tv: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const FileCheck2: LucideIcon;
  export const Receipt: LucideIcon;
  export const Smartphone: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Lock: LucideIcon;
  export const FileText: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Quote: LucideIcon;
  export const Building2: LucideIcon;
  export const Globe: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Mail: LucideIcon;
  export const Headphones: LucideIcon;
  export const Send: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const KeyRound: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Check: LucideIcon;
  export const User: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Calendar: LucideIcon;
  export const LogOut: LucideIcon;
  export const Bell: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const Plus: LucideIcon;
  export const Filter: LucideIcon;
  export const Download: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Settings: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Sliders: LucideIcon;
}

declare module "prisma/config" {
  export function defineConfig(config: any): any;
}

declare module "better-auth" {
  export function betterAuth(config?: any): any;
}

declare module "better-auth/next-js" {
  export function toNextJsHandler(auth: any): { GET: any; POST: any };
}

declare module "better-auth/react" {
  export function createAuthClient(config?: any): any;
}

declare module "@better-auth/prisma-adapter" {
  export function prismaAdapter(prisma: any): any;
}

declare module "@prisma/client" {
  export class PrismaClient {
    [key: string]: any;
  }
}
