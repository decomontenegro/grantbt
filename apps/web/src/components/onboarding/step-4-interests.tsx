"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface Step4Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const INTEREST_AREAS = [
  "Inovação Tecnológica",
  "Pesquisa & Desenvolvimento",
  "Inteligência Artificial",
  "Biotecnologia",
  "Energia Renovável",
  "Sustentabilidade",
  "Agronegócio",
  "Saúde Digital",
  "Educação",
  "Indústria 4.0",
  "Economia Circular",
  "Mobilidade",
  "Infraestrutura",
  "Exportação",
  "Internacionalização",
  "Capacitação",
];

const GRANT_AGENCIES = [
  { value: "FINEP", label: "FINEP - Financiadora de Inovação" },
  { value: "FAPESP", label: "FAPESP - Fundação de Amparo à Pesquisa de SP" },
  { value: "EMBRAPII", label: "EMBRAPII - Empresa Brasileira de P&D" },
  { value: "SEBRAE", label: "SEBRAE - Apoio a Pequenas Empresas" },
  { value: "BNDES", label: "BNDES - Banco de Desenvolvimento" },
  { value: "CNPq", label: "CNPq - Conselho Nacional de Desenvolvimento Científico" },
  { value: "HORIZONTE_EUROPA", label: "Horizonte Europa (Internacional)" },
];

export function Step4Interests({ data, onNext, onBack }: Step4Props) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(data.interestAreas || []);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(
    data.preferredAgencies || []
  );
  const [budgetRange, setBudgetRange] = useState(data.budgetRange || "");
  const [hasUniversityPartners, setHasUniversityPartners] = useState(
    data.hasUniversityPartners ?? false
  );
  const [universityPartners, setUniversityPartners] = useState(data.universityPartners || "");
  const [hasICTPartners, setHasICTPartners] = useState(data.hasICTPartners ?? false);
  const [ictPartners, setIctPartners] = useState(data.ictPartners || "");
  const [hasEmbrapiiPartners, setHasEmbrapiiPartners] = useState(
    data.hasEmbrapiiPartners ?? false
  );
  const [embrapiiPartners, setEmbrapiiPartners] = useState(data.embrapiiPartners || "");

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const toggleAgency = (agency: string) => {
    if (selectedAgencies.includes(agency)) {
      setSelectedAgencies(selectedAgencies.filter((a) => a !== agency));
    } else {
      setSelectedAgencies([...selectedAgencies, agency]);
    }
  };

  const handleNext = () => {
    if (selectedAreas.length === 0) {
      alert("Selecione pelo menos uma área de interesse");
      return;
    }
    onNext({
      interestAreas: selectedAreas,
      preferredAgencies: selectedAgencies,
      budgetRange,
      hasUniversityPartners,
      universityPartners: hasUniversityPartners
        ? universityPartners.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      hasICTPartners,
      ictPartners: hasICTPartners
        ? ictPartners.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      hasEmbrapiiPartners,
      embrapiiPartners: hasEmbrapiiPartners
        ? embrapiiPartners.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Target className="h-5 w-5" />
          <span className="font-semibold">Áreas de Interesse</span>
        </div>
        <CardTitle>O que você busca financiar?</CardTitle>
        <CardDescription>
          Selecione as áreas de interesse para recebermos recomendações mais precisas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Áreas de Interesse</Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_AREAS.map((area) => (
              <Badge
                key={area}
                variant={selectedAreas.includes(area) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArea(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Agências de Interesse (opcional)</Label>
          <div className="space-y-2">
            {GRANT_AGENCIES.map((agency) => (
              <div key={agency.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={agency.value}
                  checked={selectedAgencies.includes(agency.value)}
                  onChange={() => toggleAgency(agency.value)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor={agency.value} className="text-sm cursor-pointer">
                  {agency.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Faixa de Orçamento Buscada</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="0-100k">Até R$ 100 mil</option>
            <option value="100k-500k">R$ 100 mil - R$ 500 mil</option>
            <option value="500k-1M">R$ 500 mil - R$ 1 milhão</option>
            <option value="1M-5M">R$ 1 milhão - R$ 5 milhões</option>
            <option value="5M+">Acima de R$ 5 milhões</option>
          </select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Parcerias Estratégicas (opcional)</Label>
          <p className="text-sm text-muted-foreground">
            Muitos grants valorizam ou exigem parcerias com instituições de pesquisa
          </p>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasUniversityPartners"
                checked={hasUniversityPartners}
                onChange={(e) => setHasUniversityPartners(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="hasUniversityPartners" className="text-sm cursor-pointer font-medium">
                Possui parceria com Universidades
              </label>
            </div>
            {hasUniversityPartners && (
              <div className="space-y-2 pl-6">
                <Label>Quais universidades?</Label>
                <Input
                  placeholder="Ex: USP, UNICAMP, UFRJ (separadas por vírgula)"
                  value={universityPartners}
                  onChange={(e) => setUniversityPartners(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasICTPartners"
                checked={hasICTPartners}
                onChange={(e) => setHasICTPartners(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="hasICTPartners" className="text-sm cursor-pointer font-medium">
                Possui parceria com ICTs (Instituições de Ciência e Tecnologia)
              </label>
            </div>
            {hasICTPartners && (
              <div className="space-y-2 pl-6">
                <Label>Quais ICTs?</Label>
                <Input
                  placeholder="Ex: EMBRAPA, IPT, INT (separadas por vírgula)"
                  value={ictPartners}
                  onChange={(e) => setIctPartners(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasEmbrapiiPartners"
                checked={hasEmbrapiiPartners}
                onChange={(e) => setHasEmbrapiiPartners(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="hasEmbrapiiPartners" className="text-sm cursor-pointer font-medium">
                Possui parceria com Unidades EMBRAPII
              </label>
            </div>
            {hasEmbrapiiPartners && (
              <div className="space-y-2 pl-6">
                <Label>Quais unidades EMBRAPII?</Label>
                <Input
                  placeholder="Ex: SENAI CIMATEC, IPT (separadas por vírgula)"
                  value={embrapiiPartners}
                  onChange={(e) => setEmbrapiiPartners(e.target.value)}
                />
              </div>
            )}
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
