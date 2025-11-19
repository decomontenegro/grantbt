"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader2, Building2, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  matchScore: number | null;
  requestedAmount: string | null;
  approvedAmount: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  grant: {
    id: string;
    title: string;
    agency: string;
    category: string | null;
    valueMin: string | null;
    valueMax: string | null;
    deadline: string | null;
    status: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="border-b bg-background">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Minhas Candidaturas</h1>
              <p className="text-muted-foreground">
                {applications.length} {applications.length === 1 ? "candidatura" : "candidaturas"}
              </p>
            </div>
            <Button asChild>
              <Link href="/grants">
                <Plus className="mr-2 h-4 w-4" />
                Explorar Grants
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge status={app.status} />
                      {app.matchScore && (
                        <Badge variant="outline">
                          Match: {app.matchScore}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mb-2">{app.grant.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      Criada em: {formatDate(app.createdAt)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {app.grant.agency}
                      </div>
                      {app.grant.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {formatDate(app.grant.deadline)}
                        </div>
                      )}
                      {app.grant.valueMin && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(app.grant.valueMin, app.grant.valueMax)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/grants/${app.grant.id}`}>
                      Ver Grant
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}

          {applications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">Nenhuma candidatura ainda</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Comece sua primeira candidatura para um grant
                </p>
                <Button asChild>
                  <Link href="/grants">
                    <Plus className="mr-2 h-4 w-4" />
                    Explorar Oportunidades
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: any = {
    DRAFT: { icon: <Clock className="h-3 w-3" />, label: "Rascunho", variant: "outline" },
    IN_REVIEW: { icon: <FileText className="h-3 w-3" />, label: "Em Revisão", variant: "default" },
    SUBMITTED: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Enviado", variant: "success" },
    APPROVED: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Aprovado", variant: "success" },
    REJECTED: { icon: <XCircle className="h-3 w-3" />, label: "Rejeitado", variant: "destructive" },
  };

  const config = variants[status] || variants.DRAFT;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}
