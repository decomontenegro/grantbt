"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  DollarSign,
  Building2,
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  FileText,
  Clock,
  MapPin,
  Users,
  TrendingUp
} from "lucide-react";

interface Grant {
  id: string;
  title: string;
  description: string;
  agency: string;
  category: string;
  valueMin: string | null;
  valueMax: string | null;
  deadline: string | null;
  status: string;
  url: string | null;
  keywords: string[];
  matchScore?: number;
  matchReasons?: string[];
}

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;

  const [grant, setGrant] = useState<Grant | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchGrantDetail = async () => {
      try {
        setLoading(true);
        // Fetch all grants and find the specific one
        const response = await fetch("/api/grants");
        if (response.ok) {
          const data = await response.json();
          const grantsData = data.grants || data;
          const foundGrant = grantsData.find((g: Grant) => g.id === grantId);

          if (foundGrant) {
            setGrant(foundGrant);
            setHasCompany(data.hasCompany || false);
          }
        }
      } catch (error) {
        console.error("Error fetching grant detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrantDetail();
  }, [grantId]);

  const formatCurrency = (min: string | null, max: string | null) => {
    if (!min && !max) return "Não especificado";

    const format = (value: string) => {
      const num = parseFloat(value);
      if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}k`;
      return `R$ ${num.toLocaleString("pt-BR")}`;
    };

    if (max && !min) return `Até ${format(max)}`;
    if (min && !max) return `A partir de ${format(min)}`;
    if (min === max) return format(min!);
    return `${format(min!)} - ${format(max!)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sem prazo";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CLOSING_SOON": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "UPCOMING": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CLOSED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN": return "Aberto";
      case "CLOSING_SOON": return "Encerrando em breve";
      case "UPCOMING": return "Em breve";
      case "CLOSED": return "Fechado";
      default: return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-600 text-white";
    if (score >= 50) return "bg-yellow-600 text-white";
    return "bg-orange-600 text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente Match";
    if (score >= 60) return "Bom Match";
    if (score >= 40) return "Match Moderado";
    return "Match Baixo";
  };

  const handleApply = async () => {
    try {
      setApplying(true);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grantId: grant?.id,
          matchScore: grant?.matchScore,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert("Você já possui uma candidatura para este grant!");
          router.push("/applications");
          return;
        }
        throw new Error(data.error || "Failed to create application");
      }

      if (data.success) {
        alert("Candidatura criada com sucesso! Você será redirecionado para suas candidaturas.");
        router.push("/applications");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      alert("Erro ao criar candidatura. Tente novamente.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Grant não encontrado</p>
            <Button onClick={() => router.push("/grants")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Grants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEligible = grant.matchScore && grant.matchScore >= 50;
  const hasBlockers = grant.matchReasons?.some(r => r.startsWith("❌"));

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/grants")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Grants
      </Button>

      {/* Hero Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getStatusColor(grant.status)}>
                  {getStatusLabel(grant.status)}
                </Badge>
                <Badge variant="outline">{grant.category}</Badge>
              </div>
              <CardTitle className="text-3xl mb-3">{grant.title}</CardTitle>
              <CardDescription className="text-base">
                {grant.description}
              </CardDescription>
            </div>

            {grant.matchScore !== undefined && hasCompany && (
              <div className="flex-shrink-0">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Score de Compatibilidade
                  </div>
                  <div className={`text-5xl font-bold mb-2 ${grant.matchScore >= 75 ? "text-green-600" : grant.matchScore >= 50 ? "text-yellow-600" : "text-orange-600"}`}>
                    {grant.matchScore}%
                  </div>
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    {getScoreLabel(grant.matchScore)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Agência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{grant.agency}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatCurrency(grant.valueMin, grant.valueMax)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatDate(grant.deadline)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{grant.category}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Match Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match Reasons Card */}
          {grant.matchReasons && grant.matchReasons.length > 0 && hasCompany && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Análise de Compatibilidade
                </CardTitle>
                <CardDescription>
                  Por que este grant {isEligible ? "é relevante" : "pode não ser ideal"} para sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grant.matchReasons.map((reason, idx) => {
                    const isPositive = reason.startsWith("✅");
                    const isWarning = reason.startsWith("⚠️");
                    const isNegative = reason.startsWith("❌");

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isPositive ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" :
                          isWarning ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800" :
                          isNegative ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" :
                          "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                        }`}
                      >
                        {isPositive && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />}
                        {isWarning && <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />}
                        {isNegative && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />}
                        <span className={`text-sm ${
                          isPositive ? "text-green-800 dark:text-green-200" :
                          isWarning ? "text-yellow-800 dark:text-yellow-200" :
                          isNegative ? "text-red-800 dark:text-red-200" :
                          "text-gray-700 dark:text-gray-300"
                        }`}>
                          {reason.replace(/^[✅⚠️❌]\s*/, "")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {hasBlockers && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-100">
                          Atenção: Possível Inelegibilidade
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          Sua empresa pode não atender a alguns requisitos obrigatórios deste grant.
                          Revise os critérios marcados com ❌ antes de se candidatar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!hasCompany && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Complete seu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Complete o perfil da sua empresa para ver uma análise de compatibilidade personalizada com este grant.
                </p>
                <Button onClick={() => router.push("/settings")}>
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {grant.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Palavras-chave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {grant.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                disabled={hasBlockers || applying}
                onClick={handleApply}
              >
                {applying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Candidatura...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {hasBlockers ? "Não Elegível" : "Candidatar-se"}
                  </>
                )}
              </Button>

              {grant.url && (
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a href={grant.url} target="_blank" rel="noopener noreferrer">
                    Ver Edital Oficial
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* CNAEs Elegíveis */}
          {grant.eligibilityCriteria && (grant.eligibilityCriteria as any).cnaeCodes && (grant.eligibilityCriteria as any).cnaeCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  CNAEs Elegíveis
                </CardTitle>
                <CardDescription>
                  Este grant especifica CNAEs aceitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Apenas empresas com um dos CNAEs abaixo podem se candidatar:
                  </p>
                  <div className="space-y-2">
                    {(grant.eligibilityCriteria as any).cnaeCodes.slice(0, 10).map((cnae: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-950 rounded border border-purple-200 dark:border-purple-800">
                        <code className="text-xs font-mono font-semibold text-purple-900 dark:text-purple-100 mt-0.5">
                          {cnae}
                        </code>
                      </div>
                    ))}
                    {(grant.eligibilityCriteria as any).cnaeCodes.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        + {(grant.eligibilityCriteria as any).cnaeCodes.length - 10} outros CNAEs
                      </p>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      💡 Adicione seus CNAEs no <a href="/settings" className="underline font-semibold">perfil da empresa</a> para matching automático
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getStatusLabel(grant.status)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Agência</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {grant.agency}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Categoria</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {grant.category}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
