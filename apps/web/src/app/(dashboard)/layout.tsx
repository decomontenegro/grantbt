import Link from "next/link";
import { Brain, LayoutDashboard, FileText, Target, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">GrantBR</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <NavLink href="/dashboard" icon={<LayoutDashboard />}>
              Dashboard
            </NavLink>
            <NavLink href="/grants" icon={<Target />}>
              Oportunidades
            </NavLink>
            <NavLink href="/applications" icon={<FileText />}>
              Minhas Candidaturas
            </NavLink>
            <NavLink href="/settings" icon={<Settings />}>
              Configurações
            </NavLink>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="mb-2 rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Empresa Demo</p>
              <p className="text-xs text-muted-foreground">Plano Gratuito</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      <span className="h-5 w-5">{icon}</span>
      {children}
    </Link>
  );
}
