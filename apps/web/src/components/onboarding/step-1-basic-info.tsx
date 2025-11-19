"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface Step1Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step1BasicInfo({ data, onNext }: Step1Props) {
  const [cnpj, setCnpj] = useState(data.cnpj || "");
  const [companyName, setCompanyName] = useState(data.companyName || "");
  const [legalName, setLegalName] = useState(data.legalName || "");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!cnpj || !companyName) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    // TODO: Validate CNPJ via API Receita Federal
    // For now, just pass the data

    onNext({ cnpj, companyName, legalName });
    setLoading(false);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" />
          <span className="font-semibold">Informações Básicas</span>
        </div>
        <CardTitle>Vamos começar com sua empresa</CardTitle>
        <CardDescription>
          Informe os dados básicos da sua empresa. Usaremos o CNPJ para buscar informações públicas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">
            CNPJ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            maxLength={18}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">
            Nome Fantasia <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Nome da sua empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalName">Razão Social</Label>
          <Input
            id="legalName"
            placeholder="Razão social (opcional)"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleNext} disabled={loading}>
            {loading ? "Carregando..." : "Próximo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
