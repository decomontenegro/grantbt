"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function ApplicationEditorPage({ params }: { params: { id: string } }) {
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Mock data
  const application = {
    grant: "Subvenção Econômica à Inovação - FINEP",
    status: "DRAFT",
    evaluationScore: 78,
  };

  const [sections, setSections] = useState({
    executiveSummary: "Nossa empresa desenvolve soluções inovadoras em IA...",
    problem: "",
    solution: "",
    methodology: "",
    timeline: "",
    budget: "",
    team: "",
    impact: "",
  });

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setSections({
      executiveSummary:
        "Nossa empresa desenvolve soluções inovadoras em inteligência artificial aplicada ao agronegócio, com foco em otimização de processos e aumento de produtividade através de análise preditiva e automação.",
      problem:
        "O setor agrícola enfrenta desafios significativos relacionados à eficiência produtiva e ao uso sustentável de recursos. Problemas como desperdício de insumos, dificuldade na previsão de safras e falta de dados precisos para tomada de decisão afetam diretamente a rentabilidade e competitividade dos produtores brasileiros.",
      solution:
        "Propomos o desenvolvimento de uma plataforma de IA que integra sensores IoT, análise de imagens via satélite e algoritmos de machine learning para fornecer insights em tempo real sobre condições de solo, clima e saúde das plantas, permitindo decisões baseadas em dados e aumentando a eficiência em até 40%.",
      methodology:
        "O projeto será desenvolvido em 18 meses, utilizando metodologia ágil com sprints quinzenais. Fase 1: Pesquisa e prototipagem (6 meses). Fase 2: Desenvolvimento e testes (8 meses). Fase 3: Validação em campo e ajustes (4 meses).",
      timeline: "Duração total: 18 meses. Início previsto: Janeiro/2026.",
      budget:
        "Orçamento total: R$ 1.500.000. Distribuição: 40% RH (equipe técnica), 30% infraestrutura e equipamentos, 20% P&D e testes, 10% divulgação e capacitação.",
      team:
        "Equipe multidisciplinar com 2 PhDs em IA, 3 mestres em agronomia, e 5 desenvolvedores sênior. Total de 15 pessoas dedicadas ao projeto.",
      impact:
        "Impacto esperado: Aumento de 40% na eficiência produtiva para agricultores adotantes, redução de 30% no uso de insumos, criação de 20 empregos diretos e estabelecimento do Brasil como referência em agtech.",
    });

    setGenerating(false);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setEvaluating(false);
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="border-b bg-background">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge>Rascunho</Badge>
                {application.evaluationScore && (
                  <Badge variant="outline">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Score: {application.evaluationScore}/100
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{application.grant}</h1>
              <p className="text-muted-foreground">Editor de Candidatura com IA</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEvaluate} disabled={evaluating}>
                {evaluating ? "Avaliando..." : "Avaliar Proposta"}
              </Button>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Geração Automática com IA
                </CardTitle>
                <CardDescription>
                  Nossa IA pode gerar um rascunho completo da proposta baseado no seu perfil e no
                  edital
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerateWithAI} disabled={generating} className="w-full">
                  {generating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Gerando proposta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Proposta com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Sections */}
            {Object.entries(sections).map(([key, value]) => (
              <EditorSection
                key={key}
                title={getSectionTitle(key)}
                content={value}
                onChange={(newValue) => setSections({ ...sections, [key]: newValue })}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completo</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 bg-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CheckItem checked label="Resumo Executivo" />
                <CheckItem checked label="Descrição do Problema" />
                <CheckItem checked label="Solução Proposta" />
                <CheckItem checked label="Metodologia" />
                <CheckItem label="Orçamento Detalhado" />
                <CheckItem label="Qualificações da Equipe" />
              </CardContent>
            </Card>

            {/* AI Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback da IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm">Inovação bem articulada</p>
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm">Expandir seção de impacto com métricas quantitativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSectionTitle(key: string): string {
  const titles: { [key: string]: string } = {
    executiveSummary: "Resumo Executivo",
    problem: "Descrição do Problema",
    solution: "Solução Proposta",
    methodology: "Metodologia",
    timeline: "Cronograma",
    budget: "Orçamento",
    team: "Equipe",
    impact: "Impacto Esperado",
  };
  return titles[key] || key;
}

function EditorSection({
  title,
  content,
  onChange,
}: {
  title: string;
  content: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Escreva a seção "${title}" aqui...`}
        />
      </CardContent>
    </Card>
  );
}

function CheckItem({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded border ${
          checked ? "border-primary bg-primary" : "border-muted-foreground"
        }`}
      >
        {checked && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
      </div>
      <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>
        {label}
      </span>
    </div>
  );
}
