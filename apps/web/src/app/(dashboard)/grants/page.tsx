"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ExternalLink, Calendar, DollarSign, Building2, Filter, Target, CheckCircle2, AlertCircle, XCircle, ArrowRight } from "lucide-react";

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
  createdAt?: string;
  matchScore?: number;
  matchReasons?: string[];
}

export default function GrantsPage() {
  const router = useRouter();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [cnaeFilter, setCnaeFilter] = useState<string>("all");
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("matchScore");

  useEffect(() => {
    fetchGrants();
  }, []);

  useEffect(() => {
    filterGrants();
  }, [grants, searchTerm, selectedAgency, selectedCategory, selectedStatus, cnaeFilter, minMatchScore, sortBy]);

  const fetchGrants = async () => {
    try {
      const response = await fetch("/api/grants");
      if (response.ok) {
        const data = await response.json();
        // API returns { grants: [...], hasCompany: boolean }
        const grantsData = data.grants || data;
        setGrants(grantsData);
        setFilteredGrants(grantsData);
      }
    } catch (error) {
      console.error("Error fetching grants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterGrants = () => {
    let filtered = [...grants];

    if (searchTerm) {
      filtered = filtered.filter(
        (grant) =>
          grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grant.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedAgency !== "all") {
      filtered = filtered.filter((grant) => grant.agency === selectedAgency);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((grant) => grant.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((grant) => grant.status === selectedStatus);
    }

    // Filter by CNAE requirements
    if (cnaeFilter === "with_cnae") {
      filtered = filtered.filter((grant) => {
        const criteria = grant.eligibilityCriteria as any;
        return criteria?.cnaeCodes && criteria.cnaeCodes.length > 0;
      });
    } else if (cnaeFilter === "without_cnae") {
      filtered = filtered.filter((grant) => {
        const criteria = grant.eligibilityCriteria as any;
        return !criteria?.cnaeCodes || criteria.cnaeCodes.length === 0;
      });
    }

    // Filter by minimum match score
    if (minMatchScore > 0) {
      filtered = filtered.filter((grant) => (grant.matchScore || 0) >= minMatchScore);
    }

    // Sort grants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "matchScore":
          return (b.matchScore || 0) - (a.matchScore || 0);
        case "deadline":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "valueMax":
          const aVal = parseFloat(a.valueMax || "0");
          const bVal = parseFloat(b.valueMax || "0");
          return bVal - aVal;
        default:
          return 0;
      }
    });

    setFilteredGrants(filtered);
  };

  const agencies = Array.from(new Set(grants.map((g) => g.agency))).sort();
  const categories = Array.from(new Set(grants.map((g) => g.category))).sort();
  const statuses = Array.from(new Set(grants.map((g) => g.status))).sort();

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
    return date.toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-green-100 text-green-800";
      case "UPCOMING": return "bg-blue-100 text-blue-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN": return "Aberto";
      case "UPCOMING": return "Em breve";
      case "CLOSED": return "Fechado";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explorar Grants</h1>
        <p className="text-gray-600">
          {filteredGrants.length} de {grants.length} grants disponíveis
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, descrição ou palavras-chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedAgency} onValueChange={setSelectedAgency}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as agências" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as agências</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cnaeFilter} onValueChange={setCnaeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtro CNAE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grants</SelectItem>
                <SelectItem value="with_cnae">Especifica CNAEs elegíveis</SelectItem>
                <SelectItem value="without_cnae">Sem restrição de CNAE</SelectItem>
              </SelectContent>
            </Select>

            <Select value={minMatchScore.toString()} onValueChange={(value) => setMinMatchScore(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Match mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todos os matches</SelectItem>
                <SelectItem value="40">Match &gt; 40%</SelectItem>
                <SelectItem value="60">Match &gt; 60%</SelectItem>
                <SelectItem value="75">Match &gt; 75%</SelectItem>
                <SelectItem value="80">Match &gt; 80%</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Melhor Match</SelectItem>
                <SelectItem value="deadline">Prazo mais próximo</SelectItem>
                <SelectItem value="valueMax">Maior Valor</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-2 lg:col-span-2">
              <Button variant="outline" className="w-full" onClick={() => {
                  setSearchTerm("");
                  setSelectedAgency("all");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setCnaeFilter("all");
                  setMinMatchScore(0);
                  setSortBy("matchScore");
                }}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredGrants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Nenhum grant encontrado com os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          filteredGrants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{grant.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{grant.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(grant.status)}>{getStatusLabel(grant.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{grant.agency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(grant.valueMin, grant.valueMax)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(grant.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{grant.category}</Badge>
                  </div>
                </div>

                {grant.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {grant.keywords.slice(0, 5).map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{keyword}</Badge>
                    ))}
                  </div>
                )}

                {grant.matchReasons && grant.matchReasons.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Por que este grant é relevante para sua empresa?
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {grant.matchReasons.map((reason, idx) => {
                        const isPositive = reason.startsWith("✅");
                        const isWarning = reason.startsWith("⚠️");
                        const isNegative = reason.startsWith("❌");

                        return (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            {isPositive && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />}
                            {isWarning && <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />}
                            {isNegative && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />}
                            <span className={
                              isPositive ? "text-green-800 dark:text-green-200" :
                              isWarning ? "text-yellow-800 dark:text-yellow-200" :
                              isNegative ? "text-red-800 dark:text-red-200" :
                              "text-gray-700 dark:text-gray-300"
                            }>
                              {reason.replace(/^[✅⚠️❌]\s*/, "")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {grant.matchScore !== undefined && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Score de Compatibilidade:
                          </span>
                          <Badge className={
                            grant.matchScore >= 75 ? "bg-green-600" :
                            grant.matchScore >= 50 ? "bg-yellow-600" :
                            "bg-orange-600"
                          }>
                            {grant.matchScore}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/grants/${grant.id}`)}
                  >
                    Ver Detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {grant.url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={grant.url} target="_blank" rel="noopener noreferrer">
                        Edital Oficial
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
