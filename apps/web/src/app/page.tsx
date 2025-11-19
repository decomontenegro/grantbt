import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Search,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GrantBR</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Recursos
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Preços
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary">
              Entrar
            </Link>
            <Button asChild>
              <Link href="/signup">Começar Grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            🇧🇷 Feito para o mercado brasileiro
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
            Automação Inteligente de{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Grants & Financiamentos
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Descubra oportunidades, gere propostas profissionais e gerencie aprovações com IA.
            Acesse FINEP, FAPESP, EMBRAPII, SEBRAE e 1000+ editais brasileiros.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Ver Demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Teste grátis 14 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">9 Agentes de IA Trabalhando Para Você</h2>
            <p className="text-lg text-muted-foreground">
              Automação end-to-end do processo de grants
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Descoberta Automática"
              description="Monitore 24/7 mais de 1000 editais brasileiros e internacionais. Nunca perca uma oportunidade."
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Matching Inteligente"
              description="IA semântica identifica os grants mais alinhados ao seu perfil e projetos."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-8 w-8" />}
              title="Verificação de Elegibilidade"
              description="Checklist automático valida se sua empresa atende todos os requisitos."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Geração de Propostas"
              description="Gere propostas completas e profissionais em minutos, não semanas."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Avaliador Simulado"
              description="IA avalia sua candidatura como um júri real, dando feedback para melhorias."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Submissão Automática"
              description="Preencha formulários e envie candidaturas automaticamente nos portais."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t py-24">
        <div className="container">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <StatCard value="1000+" label="Grants catalogados" />
            <StatCard value="90%" label="Economia de tempo" />
            <StatCard value="2x" label="Taxa de aprovação" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-24 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Pronto para automatizar suas candidaturas?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Junte-se às empresas que já estão acelerando captação de recursos com IA.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">
              Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-bold">GrantBR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automação inteligente de grants para o ecossistema brasileiro de inovação.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features">Recursos</Link>
                </li>
                <li>
                  <Link href="/pricing">Preços</Link>
                </li>
                <li>
                  <Link href="/demo">Demo</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">Sobre</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/contact">Contato</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy">Privacidade</Link>
                </li>
                <li>
                  <Link href="/terms">Termos</Link>
                </li>
                <li>
                  <Link href="/lgpd">LGPD</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GrantBR. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="mb-2 text-4xl font-bold text-primary">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
