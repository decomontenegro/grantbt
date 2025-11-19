"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface Step6Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step6Team({ data, onNext, onBack }: Step6Props) {
  const [hasRDDepartment, setHasRDDepartment] = useState(data.hasRDDepartment ?? false);
  const [rdTeamSize, setRdTeamSize] = useState(data.rdTeamSize || "");
  const [researchersCount, setResearchersCount] = useState(data.researchersCount || "");
  const [hasPhDs, setHasPhDs] = useState(data.hasPhDs ?? false);
  const [phdCount, setPhdCount] = useState(data.phdCount || "");
  const [hasMasters, setHasMasters] = useState(data.hasMasters ?? false);
  const [mastersCount, setMastersCount] = useState(data.mastersCount || "");
  const [rdBudget, setRdBudget] = useState(data.rdBudget || "");
  const [hasCounterpartCapacity, setHasCounterpartCapacity] = useState(
    data.hasCounterpartCapacity ?? false
  );
  const [counterpartPercentage, setCounterpartPercentage] = useState(
    data.counterpartPercentage || ""
  );

  const handleNext = () => {
    onNext({
      hasRDDepartment,
      rdTeamSize: rdTeamSize ? parseInt(rdTeamSize) : 0,
      researchersCount: researchersCount ? parseInt(researchersCount) : 0,
      hasPhDs,
      phdCount: hasPhDs ? parseInt(phdCount) : 0,
      hasMasters,
      mastersCount: hasMasters ? parseInt(mastersCount) : 0,
      rdBudget: rdBudget ? parseFloat(rdBudget) : 0,
      hasCounterpartCapacity,
      counterpartPercentage: hasCounterpartCapacity ? parseFloat(counterpartPercentage) : 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Equipe</span>
        </div>
        <CardTitle>Sobre sua equipe técnica</CardTitle>
        <CardDescription>
          Informações sobre a equipe ajudam a avaliar a capacidade de execução dos projetos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>A empresa possui departamento de P&D/Inovação?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={hasRDDepartment ? "default" : "outline"}
                onClick={() => setHasRDDepartment(true)}
              >
                Sim
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!hasRDDepartment ? "default" : "outline"}
                onClick={() => setHasRDDepartment(false)}
              >
                Não
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tamanho da equipe de P&D</Label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 8"
              value={rdTeamSize}
              onChange={(e) => setRdTeamSize(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Funcionários dedicados a pesquisa e desenvolvimento
            </p>
          </div>
          <div className="space-y-2">
            <Label>Número de pesquisadores</Label>
            <Input
              type="number"
              min="0"
              placeholder="Ex: 5"
              value={researchersCount}
              onChange={(e) => setResearchersCount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pesquisadores com dedicação exclusiva
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>Doutores (PhDs) na equipe?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={hasPhDs ? "default" : "outline"}
                onClick={() => setHasPhDs(true)}
              >
                Sim
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!hasPhDs ? "default" : "outline"}
                onClick={() => {
                  setHasPhDs(false);
                  setPhdCount("");
                }}
              >
                Não
              </Button>
            </div>
          </div>
          {hasPhDs && (
            <div className="space-y-2">
              <Label>Quantos doutores?</Label>
              <Input
                type="number"
                placeholder="Ex: 2"
                value={phdCount}
                onChange={(e) => setPhdCount(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>Mestres na equipe?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={hasMasters ? "default" : "outline"}
                onClick={() => setHasMasters(true)}
              >
                Sim
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!hasMasters ? "default" : "outline"}
                onClick={() => {
                  setHasMasters(false);
                  setMastersCount("");
                }}
              >
                Não
              </Button>
            </div>
          </div>
          {hasMasters && (
            <div className="space-y-2">
              <Label>Quantos mestres?</Label>
              <Input
                type="number"
                placeholder="Ex: 5"
                value={mastersCount}
                onChange={(e) => setMastersCount(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Orçamento anual de P&D (R$) - opcional</Label>
          <Input
            type="number"
            min="0"
            step="1000"
            placeholder="Ex: 500000"
            value={rdBudget}
            onChange={(e) => setRdBudget(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Quanto sua empresa investe por ano em pesquisa e desenvolvimento
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Label>Possui capacidade de contrapartida financeira?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={hasCounterpartCapacity ? "default" : "outline"}
                onClick={() => setHasCounterpartCapacity(true)}
              >
                Sim
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!hasCounterpartCapacity ? "default" : "outline"}
                onClick={() => {
                  setHasCounterpartCapacity(false);
                  setCounterpartPercentage("");
                }}
              >
                Não
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Muitos grants exigem que a empresa invista parte do valor (contrapartida)
          </p>
          {hasCounterpartCapacity && (
            <div className="space-y-2">
              <Label>Percentual de contrapartida que pode ofertar (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="5"
                placeholder="Ex: 20"
                value={counterpartPercentage}
                onChange={(e) => setCounterpartPercentage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Percentual típico do valor total do projeto que a empresa pode investir
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={handleNext}>Próximo</Button>
        </div>
      </CardContent>
    </Card>
  );
}
