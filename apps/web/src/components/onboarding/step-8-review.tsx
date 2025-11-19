"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Rocket, Target, Users } from "lucide-react";

interface Step8Props {
  data: any;
  onBack: () => void;
  onFinish: (data: any) => void;
  loading: boolean;
}

export function Step8Review({ data, onBack, onFinish, loading }: Step8Props) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">Revisão</span>
        </div>
        <CardTitle>Tudo pronto para começar!</CardTitle>
        <CardDescription>
          Revise as informações fornecidas. Você poderá editá-las depois nas configurações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Empresa</span>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CNPJ:</span>
              <span>{data.cnpj}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span>{data.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Setor:</span>
              <span>{data.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Porte:</span>
              <span>{data.size}</span>
            </div>
            {data.city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Localização:</span>
                <span>
                  {data.city}, {data.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Rocket className="h-4 w-4 text-primary" />
              <span>Projetos</span>
            </div>
            <div className="space-y-2">
              {data.projects.map((project: any, idx: number) => (
                <div key={idx} className="rounded-lg border p-3">
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.description.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {data.interestAreas && data.interestAreas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4 text-primary" />
              <span>Áreas de Interesse</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.interestAreas.map((area: string) => (
                <span
                  key={area}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {data.teamSize && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-primary" />
              <span>Equipe</span>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tamanho:</span>
                <span>{data.teamSize} pessoas</span>
              </div>
              {data.hasPhDs && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doutores:</span>
                  <span>{data.phdCount}</span>
                </div>
              )}
              {data.hasMasters && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mestres:</span>
                  <span>{data.mastersCount}</span>
                </div>
              )}
              {data.rdPercentage && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% em P&D:</span>
                  <span>{data.rdPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            Ao finalizar, nosso sistema de IA começará imediatamente a buscar oportunidades de grants
            compatíveis com seu perfil. Você receberá recomendações personalizadas no dashboard.
          </p>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            Voltar
          </Button>
          <Button onClick={() => onFinish({})} disabled={loading}>
            {loading ? "Finalizando..." : "Finalizar e Ir para Dashboard"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
