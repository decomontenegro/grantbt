"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  FileText,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Star,
  Award,
} from "lucide-react";
import Link from "next/link";

interface Grant {
  id: string;
  title: string;
  agency: string;
  matchScore: number;
  rating: number; // Comprehensive rating (0-100)
  deadline: string;
  category: string;
  valueMin: number | null;
  valueMax: number | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    recommendedGrants: 0,
    activeApplications: 0,
    matchScore: 0,
    daysToDeadline: 0,
    deadlineGrantName: "",
  });
  const [topGrants, setTopGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setTopGrants(data.topGrants || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatGrantValue = (valueMin: number | null, valueMax: number | null): string => {
    if (!valueMin && !valueMax) return "Valor não especificado";
    if (valueMax) {
      if (valueMax >= 1000000) {
        return `Até R$ ${(valueMax / 1000000).toFixed(0)}M`;
      }
      return `Até R$ ${(valueMax / 1000).toFixed(0)}k`;
    }
    if (valueMin) {
      if (valueMin >= 1000000) {
        return `A partir de R$ ${(valueMin / 1000000).toFixed(0)}M`;
      }
      return `A partir de R$ ${(valueMin / 1000).toFixed(0)}k`;
    }
    return "Valor não especificado";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo de volta! Aqui estão suas oportunidades.
              </p>
            </div>
            <Button asChild>
              <Link href="/grants">
                <Sparkles className="mr-2 h-4 w-4" />
                Ver Todas as Oportunidades
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard
            title="Grants Recomendados"
            value={stats.recommendedGrants}
            icon={<Target className="h-5 w-5" />}
            trend="+3 esta semana"
          />
          <StatCard
            title="Candidaturas Ativas"
            value={stats.activeApplications}
            icon={<FileText className="h-5 w-5" />}
            trend="2 em rascunho"
          />
          <StatCard
            title="Match Score Médio"
            value={`${stats.matchScore}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="Alta compatibilidade"
          />
          <StatCard
            title="Próximo Prazo"
            value={`${stats.daysToDeadline} dias`}
            icon={<Clock className="h-5 w-5" />}
            trend={stats.deadlineGrantName}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recommended Grants */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Grants Recomendados Para Você</h2>
              <Link href="/grants" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-4">
              {topGrants.length > 0 ? (
                topGrants.map((grant) => (
                  <GrantCard
                    key={grant.id}
                    id={grant.id}
                    title={grant.title}
                    agency={grant.agency}
                    value={formatGrantValue(grant.valueMin, grant.valueMax)}
                    matchScore={grant.matchScore}
                    rating={grant.rating}
                    deadline={grant.deadline}
                    category={grant.category}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Nenhum grant recomendado ainda. Complete seu perfil para receber recomendações personalizadas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/applications/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Nova Candidatura
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Building2 className="mr-2 h-4 w-4" />
                    Atualizar Perfil
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-3 dark:bg-blue-950/20">
                  <p className="text-sm">
                    <strong>Novo match!</strong> Encontramos 3 novos grants compatíveis com
                    seus projetos de IA.
                  </p>
                </div>
                <div className="rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50 p-3 dark:bg-yellow-950/20">
                  <p className="text-sm">
                    <strong>Prazo próximo:</strong> FINEP Subvenção fecha em 15 dias.
                    Comece sua candidatura agora!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function GrantCard({
  id,
  title,
  agency,
  value,
  matchScore,
  rating,
  deadline,
  category,
}: {
  id: string;
  title: string;
  agency: string;
  value: string;
  matchScore: number;
  rating: number;
  deadline: string;
  category: string;
}) {
  // Helper function to get rating color and label
  const getRatingInfo = (rating: number) => {
    if (rating >= 85) {
      return {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Excelente",
        stars: 5,
        badgeVariant: "default" as const,
      };
    } else if (rating >= 75) {
      return {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "Muito Bom",
        stars: 4,
        badgeVariant: "default" as const,
      };
    } else if (rating >= 65) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Bom",
        stars: 3,
        badgeVariant: "secondary" as const,
      };
    } else if (rating >= 50) {
      return {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Regular",
        stars: 2,
        badgeVariant: "secondary" as const,
      };
    } else {
      return {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Baixo",
        stars: 1,
        badgeVariant: "outline" as const,
      };
    }
  };

  const ratingInfo = getRatingInfo(rating);

  return (
    <Card className="hover:border-primary transition-colors cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{agency}</Badge>
              <Badge variant={matchScore >= 75 ? "default" : "secondary"}>
                {matchScore}% match
              </Badge>
              {/* Comprehensive Rating Badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${ratingInfo.color} font-semibold text-xs`}>
                <Award className="h-3.5 w-3.5" />
                <span>Nota: {rating}/100</span>
                <div className="flex items-center gap-0.5 ml-1">
                  {Array.from({ length: ratingInfo.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-3 text-sm text-muted-foreground">{category}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {value}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {deadline}
              </span>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href={`/grants/${id}`}>
              Ver Detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
