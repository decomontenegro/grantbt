"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";

interface Step2Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const COMPANY_SIZES = [
  { value: "MEI", label: "MEI - Microempreendedor Individual" },
  { value: "MICRO", label: "Micro - Menos de 10 funcionários" },
  { value: "SMALL", label: "Pequena - 10 a 49 funcionários" },
  { value: "MEDIUM", label: "Média - 50 a 249 funcionários" },
  { value: "LARGE", label: "Grande - 250+ funcionários" },
];

const SECTORS = [
  "Tecnologia da Informação",
  "Biotecnologia",
  "Energia",
  "Saúde",
  "Agronegócio",
  "Manufatura",
  "Educação",
  "Serviços",
  "Outro",
];

export function Step2CompanyDetails({ data, onNext, onBack }: Step2Props) {
  const [sector, setSector] = useState(data.sector || "");
  const [size, setSize] = useState(data.size || "");
  const [description, setDescription] = useState(data.description || "");
  const [website, setWebsite] = useState(data.website || "");
  const [city, setCity] = useState(data.city || "");
  const [state, setState] = useState(data.state || "");
  const [cnaeCode, setCnaeCode] = useState(data.cnaeCode || "");
  const [employeeCount, setEmployeeCount] = useState(data.employeeCount || "");
  const [annualRevenue, setAnnualRevenue] = useState(data.annualRevenue || "");

  const handleNext = () => {
    if (!sector || !size || !description || !employeeCount || !annualRevenue) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    onNext({
      sector,
      size,
      description,
      website,
      city,
      state,
      cnaeCode,
      employeeCount: parseInt(employeeCount),
      annualRevenue: parseFloat(annualRevenue),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Briefcase className="h-5 w-5" />
          <span className="font-semibold">Detalhes da Empresa</span>
        </div>
        <CardTitle>Conte-nos mais sobre sua empresa</CardTitle>
        <CardDescription>
          Essas informações nos ajudarão a encontrar grants mais adequados ao seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sector">
            Setor de Atuação <span className="text-destructive">*</span>
          </Label>
          <select
            id="sector"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">Selecione...</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">
            Porte da Empresa <span className="text-destructive">*</span>
          </Label>
          <select
            id="size"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Selecione...</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Descrição da Empresa <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="description"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Descreva brevemente o que sua empresa faz, seus produtos/serviços e diferenciais..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              placeholder="Ex: SP"
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (opcional)</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.suaempresa.com.br"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cnaeCode">Código CNAE (opcional)</Label>
            <Input
              id="cnaeCode"
              placeholder="Ex: 6201-5/00"
              value={cnaeCode}
              onChange={(e) => setCnaeCode(e.target.value)}
              maxLength={20}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employeeCount">
              Número de Funcionários <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employeeCount"
              type="number"
              min="0"
              placeholder="Ex: 25"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualRevenue">
              Faturamento Anual (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="annualRevenue"
              type="number"
              min="0"
              step="1000"
              placeholder="Ex: 1500000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Faturamento bruto anual aproximado
            </p>
          </div>
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
