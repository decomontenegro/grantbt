"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { History, Plus, X } from "lucide-react";

interface Step5Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

interface PastGrant {
  program: string;
  agency: string;
  year: string;
  amount: string;
  status: string;
}

export function Step5History({ data, onNext, onBack }: Step5Props) {
  const [hasPastGrants, setHasPastGrants] = useState(data.hasPastGrants ?? true);
  const [pastGrants, setPastGrants] = useState<PastGrant[]>(
    data.pastGrants || []
  );

  const addGrant = () => {
    setPastGrants([
      ...pastGrants,
      { program: "", agency: "", year: "", amount: "", status: "approved" },
    ]);
  };

  const removeGrant = (index: number) => {
    setPastGrants(pastGrants.filter((_, i) => i !== index));
  };

  const updateGrant = (index: number, field: keyof PastGrant, value: string) => {
    const updated = [...pastGrants];
    updated[index][field] = value;
    setPastGrants(updated);
  };

  const handleNext = () => {
    onNext({ hasPastGrants, pastGrants });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <History className="h-5 w-5" />
          <span className="font-semibold">Histórico</span>
        </div>
        <CardTitle>Experiência com grants anteriores</CardTitle>
        <CardDescription>
          Compartilhe seu histórico com grants. Isso nos ajuda a entender melhor seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Sua empresa já se candidatou ou recebeu algum grant antes?</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={hasPastGrants ? "default" : "outline"}
              onClick={() => setHasPastGrants(true)}
            >
              Sim
            </Button>
            <Button
              type="button"
              variant={!hasPastGrants ? "default" : "outline"}
              onClick={() => {
                setHasPastGrants(false);
                setPastGrants([]);
              }}
            >
              Não
            </Button>
          </div>
        </div>

        {hasPastGrants && (
          <div className="space-y-4">
            {pastGrants.map((grant, index) => (
              <div key={index} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grant {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGrant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Programa</Label>
                    <Input
                      placeholder="Ex: PIPE FAPESP"
                      value={grant.program}
                      onChange={(e) => updateGrant(index, "program", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      placeholder="Ex: FAPESP"
                      value={grant.agency}
                      onChange={(e) => updateGrant(index, "agency", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input
                      type="number"
                      placeholder="2023"
                      value={grant.year}
                      onChange={(e) => updateGrant(index, "year", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={grant.amount}
                      onChange={(e) => updateGrant(index, "amount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={grant.status}
                      onChange={(e) => updateGrant(index, "status", e.target.value)}
                    >
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addGrant} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Grant
            </Button>
          </div>
        )}

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
