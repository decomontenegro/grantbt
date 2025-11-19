"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Users, Sliders, Save, Target, Award, TrendingUp, Loader2 } from "lucide-react";
import type { CompanyProfile } from "@grantbr/database/src/types";
import { CnaeManager } from "@/components/CnaeManager";

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

const COMPANY_SIZES = [
  { value: "MEI", label: "MEI - Microempreendedor Individual" },
  { value: "MICRO", label: "Micro - Menos de 10 funcionários" },
  { value: "SMALL", label: "Pequena - 10 a 49 funcionários" },
  { value: "MEDIUM", label: "Média - 50 a 249 funcionários" },
  { value: "LARGE", label: "Grande - 250+ funcionários" },
];

const TRL_LEVELS = [
  { value: "1", label: "TRL 1 - Princípios básicos observados" },
  { value: "2", label: "TRL 2 - Conceito tecnológico formulado" },
  { value: "3", label: "TRL 3 - Prova de conceito experimental" },
  { value: "4", label: "TRL 4 - Validação em laboratório" },
  { value: "5", label: "TRL 5 - Validação em ambiente relevante" },
  { value: "6", label: "TRL 6 - Demonstração em ambiente relevante" },
  { value: "7", label: "TRL 7 - Demonstração em ambiente operacional" },
  { value: "8", label: "TRL 8 - Sistema completo e qualificado" },
  { value: "9", label: "TRL 9 - Sistema comprovado em ambiente operacional" },
];

const TECHNOLOGY_TAGS = [
  "Inteligência Artificial",
  "Machine Learning",
  "Deep Learning",
  "Processamento de Linguagem Natural",
  "Visão Computacional",
  "Internet das Coisas (IoT)",
  "Big Data",
  "Análise de Dados",
  "Blockchain",
  "Cloud Computing",
  "Edge Computing",
  "5G",
  "Biotecnologia",
  "Bioinformática",
  "Engenharia Genética",
  "Nanotecnologia",
  "Energia Solar",
  "Energia Eólica",
  "Biocombustíveis",
  "Hidrogênio Verde",
  "Robótica",
  "Automação Industrial",
  "Indústria 4.0",
  "Manufatura Aditiva (Impressão 3D)",
  "Realidade Virtual",
  "Realidade Aumentada",
  "Cybersegurança",
  "Agricultura de Precisão",
  "Telemedicina",
  "Dispositivos Médicos",
  "Economia Circular",
  "Tratamento de Resíduos",
  "Mobilidade Elétrica",
  "Veículos Autônomos",
];

const SDG_LIST = [
  { value: "1", label: "ODS 1 - Erradicação da Pobreza" },
  { value: "2", label: "ODS 2 - Fome Zero e Agricultura Sustentável" },
  { value: "3", label: "ODS 3 - Saúde e Bem-Estar" },
  { value: "4", label: "ODS 4 - Educação de Qualidade" },
  { value: "5", label: "ODS 5 - Igualdade de Gênero" },
  { value: "6", label: "ODS 6 - Água Potável e Saneamento" },
  { value: "7", label: "ODS 7 - Energia Limpa e Acessível" },
  { value: "8", label: "ODS 8 - Trabalho Decente e Crescimento Econômico" },
  { value: "9", label: "ODS 9 - Indústria, Inovação e Infraestrutura" },
  { value: "10", label: "ODS 10 - Redução das Desigualdades" },
  { value: "11", label: "ODS 11 - Cidades e Comunidades Sustentáveis" },
  { value: "12", label: "ODS 12 - Consumo e Produção Responsáveis" },
  { value: "13", label: "ODS 13 - Ação Contra a Mudança Global do Clima" },
  { value: "14", label: "ODS 14 - Vida na Água" },
  { value: "15", label: "ODS 15 - Vida Terrestre" },
  { value: "16", label: "ODS 16 - Paz, Justiça e Instituições Eficazes" },
  { value: "17", label: "ODS 17 - Parcerias e Meios de Implementação" },
];

const CERTIFICATIONS = [
  "ISO 9001 - Gestão da Qualidade",
  "ISO 14001 - Gestão Ambiental",
  "ISO 45001 - Saúde e Segurança Ocupacional",
  "ISO 27001 - Segurança da Informação",
  "ISO 50001 - Gestão de Energia",
  "OHSAS 18001",
  "SA 8000 - Responsabilidade Social",
  "INMETRO",
  "ANVISA",
  "Certificação Orgânica",
  "Certificação Fair Trade",
  "Sistema B",
  "Outras",
];

const GRANT_TYPES = [
  { value: "NAO_REEMBOLSAVEL", label: "Não-reembolsável (Fundo Perdido)" },
  { value: "REEMBOLSAVEL", label: "Reembolsável (Financiamento)" },
  { value: "EQUITY", label: "Participação Societária (Equity)" },
  { value: "CREDITO_FISCAL", label: "Crédito Fiscal / Incentivo Tributário" },
];

const RD_THEMES = [
  "Pesquisa Científica",
  "Desenvolvimento Tecnológico",
  "Prova de Conceito",
  "Inovação Radical",
  "Inovação Incremental",
  "Desenvolvimento de Produto",
  "Melhoria de Processo",
  "Pesquisa Aplicada",
  "Pesquisa Básica",
  "Transferência de Tecnologia",
];

const PROJECT_STAGES = [
  { value: "IDEA", label: "Ideia / Conceito Inicial" },
  { value: "PROTOTYPE", label: "Protótipo / PoC" },
  { value: "MVP", label: "MVP / Piloto" },
  { value: "MARKET_READY", label: "Pronto para Mercado" },
  { value: "SCALE", label: "Escala / Expansão" },
];

export default function SettingsPage() {
  // Basic Info
  const [companyName, setCompanyName] = useState("Empresa Demo");
  const [cnpj, setCnpj] = useState("00.000.000/0000-00");
  const [legalName, setLegalName] = useState("");
  const [foundationDate, setFoundationDate] = useState("2020-01-15");

  // Company Details
  const [sector, setSector] = useState("Tecnologia da Informação");
  const [size, setSize] = useState("SMALL");
  const [description, setDescription] = useState("Empresa de desenvolvimento de software focada em soluções para o setor público.");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [cnaeCode, setCnaeCode] = useState("");
  const [cnaes, setCnaes] = useState<Array<{code: string, description: string, isPrimary: boolean}>>([]);

  // Technologies & Capabilities
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([
    "Inteligência Artificial",
    "Cloud Computing",
  ]);
  const [selectedRDThemes, setSelectedRDThemes] = useState<string[]>([
    "Desenvolvimento Tecnológico",
    "Inovação Incremental",
  ]);
  const [projectStage, setProjectStage] = useState("MVP");
  const [trlLevel, setTrlLevel] = useState("5");
  const [hasRD, setHasRD] = useState(true);
  const [rdTeamSize, setRdTeamSize] = useState("8");
  const [phdCount, setPhdCount] = useState("2");
  const [mastersCount, setMastersCount] = useState("3");
  const [hasPatents, setHasPatents] = useState(false);
  const [patentCount, setPatentCount] = useState("0");
  const [pendingPatents, setPendingPatents] = useState("0");

  // Financial Capacity
  const [employeeCount, setEmployeeCount] = useState("25");
  const [annualRevenue, setAnnualRevenue] = useState("1500000");
  const [rdBudget, setRdBudget] = useState("150000");
  const [rdPercentage, setRdPercentage] = useState("10");
  const [hasCounterpart, setHasCounterpart] = useState(true);
  const [counterpartPercentage, setCounterpartPercentage] = useState("20");
  const [maxCounterpartValue, setMaxCounterpartValue] = useState("300000");
  const [minProjectValue, setMinProjectValue] = useState("100000");
  const [maxProjectValue, setMaxProjectValue] = useState("1000000");

  // Partnerships & Certifications
  const [universities, setUniversities] = useState<string[]>(["USP", "UNICAMP"]);
  const [icts, setIcts] = useState<string[]>([]);
  const [embrapiiUnits, setEmbrapiiUnits] = useState<string[]>([]);
  const [openToPartnerships, setOpenToPartnerships] = useState(true);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([
    "ISO 9001 - Gestão da Qualidade",
  ]);
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>(["9", "13"]);
  const [hasPastGrants, setHasPastGrants] = useState(false);

  // Matching Preferences
  const [autoMatch, setAutoMatch] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [selectedGrantTypes, setSelectedGrantTypes] = useState<string[]>([
    "NAO_REEMBOLSAVEL",
    "REEMBOLSAVEL",
  ]);
  const [maxCounterpart, setMaxCounterpart] = useState(50);
  const [notifications, setNotifications] = useState({
    email: true,
    deadlineAlerts: true,
    newMatches: true,
    weeklyDigest: false,
  });

  // Account state
  const [email, setEmail] = useState("usuario@example.com");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Load company data on mount
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/company/profile");

        if (!response.ok) {
          throw new Error("Failed to load company data");
        }

        const data = await response.json();
        const profile = data.profileData as CompanyProfile | null;

        // Set company ID
        setCompanyId(data.id);

        // Basic Info
        setCompanyName(data.name || "");
        setCnpj(data.cnpj || "");
        setLegalName(data.legalName || "");
        setFoundationDate(data.foundationDate ? data.foundationDate.split("T")[0] : "");

        // Company Details
        setSector(data.sector || "");
        setSize(data.size || "SMALL");
        setDescription(data.description || "");
        setWebsite(data.website || "");
        setCity(data.city || "");
        setState(data.state || "");
        setCnaeCode(data.cnaeCode || "");

        if (profile) {
          // CNAEs
          if (profile.cnaes) {
            setCnaes(profile.cnaes);
          }

          // Financial
          if (profile.financial) {
            setEmployeeCount(profile.financial.employeeCount?.toString() || "");
            setAnnualRevenue(profile.financial.annualRevenue?.toString() || "");
            setRdBudget(profile.financial.rdBudget?.toString() || "");
            setRdPercentage(profile.financial.rdPercentage?.toString() || "");
            setHasCounterpart(profile.financial.hasCounterpartCapacity || false);
            setCounterpartPercentage(profile.financial.typicalCounterpart?.toString() || "");
          }

          // Team
          if (profile.team) {
            setHasRD(profile.team.hasRDDepartment || false);
            setRdTeamSize(profile.team.rdTeamSize?.toString() || "");
            setPhdCount(profile.team.phdCount?.toString() || "");
            setMastersCount(profile.team.mastersCount?.toString() || "");
          }

          // R&D Themes and Project Stage
          setSelectedRDThemes(profile.rdThemes || []);
          if (profile.projectStage) {
            setProjectStage(profile.projectStage);
          }

          // Patents
          if (profile.patents) {
            const hasAnyPatents = (profile.patents.registered || 0) > 0 || (profile.patents.pending || 0) > 0;
            setHasPatents(hasAnyPatents);
            setPatentCount(profile.patents.registered?.toString() || "0");
            setPendingPatents(profile.patents.pending?.toString() || "0");
          }

          // Partnerships
          if (profile.partnerships) {
            setUniversities(profile.partnerships.universities || []);
            setIcts(profile.partnerships.icts || []);
            setEmbrapiiUnits(profile.partnerships.embrapiiUnits || []);
          }

          // Interests (Technologies)
          setSelectedTechnologies(profile.interests || []);

          // Certifications
          setSelectedCertifications(profile.certifications || []);

          // SDGs
          setSelectedSDGs(profile.impact?.odsAlignment?.map(String) || []);

          // Experience
          if (profile.experience) {
            setHasPastGrants((profile.experience.pastGrants?.length || 0) > 0);
          }

          // Preferences
          if (profile.preferences) {
            if (profile.preferences.maxCounterpart) {
              setMaxCounterpart(profile.preferences.maxCounterpart);
            }
          }
        }
      } catch (error) {
        console.error("Error loading company data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  // Toggle functions
  const toggleTechnology = (tech: string) => {
    if (!Array.isArray(selectedTechnologies)) {
      setSelectedTechnologies([tech]);
      return;
    }
    if (selectedTechnologies.includes(tech)) {
      setSelectedTechnologies(selectedTechnologies.filter((t) => t !== tech));
    } else {
      setSelectedTechnologies([...selectedTechnologies, tech]);
    }
  };

  const toggleCertification = (cert: string) => {
    if (!Array.isArray(selectedCertifications)) {
      setSelectedCertifications([cert]);
      return;
    }
    if (selectedCertifications.includes(cert)) {
      setSelectedCertifications(selectedCertifications.filter((c) => c !== cert));
    } else {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
  };

  const toggleSDG = (sdg: string) => {
    if (!Array.isArray(selectedSDGs)) {
      setSelectedSDGs([sdg]);
      return;
    }
    if (selectedSDGs.includes(sdg)) {
      setSelectedSDGs(selectedSDGs.filter((s) => s !== sdg));
    } else {
      setSelectedSDGs([...selectedSDGs, sdg]);
    }
  };

  const toggleGrantType = (type: string) => {
    if (!Array.isArray(selectedGrantTypes)) {
      setSelectedGrantTypes([type]);
      return;
    }
    if (selectedGrantTypes.includes(type)) {
      setSelectedGrantTypes(selectedGrantTypes.filter((t) => t !== type));
    } else {
      setSelectedGrantTypes([...selectedGrantTypes, type]);
    }
  };

  const toggleRDTheme = (theme: string) => {
    if (!Array.isArray(selectedRDThemes)) {
      setSelectedRDThemes([theme]);
      return;
    }
    if (selectedRDThemes.includes(theme)) {
      setSelectedRDThemes(selectedRDThemes.filter((t) => t !== theme));
    } else {
      setSelectedRDThemes([...selectedRDThemes, theme]);
    }
  };

  // Helper function to build CompanyProfile object
  const buildProfileData = (): CompanyProfile => {
    return {
      cnaes: cnaes.length > 0 ? cnaes : undefined,
      financial: {
        annualRevenue: parseFloat(annualRevenue) || 0,
        revenueYear: new Date().getFullYear(),
        employeeCount: parseInt(employeeCount) || 0,
        rdBudget: parseFloat(rdBudget) || undefined,
        rdPercentage: parseFloat(rdPercentage) || undefined,
        hasCounterpartCapacity: hasCounterpart,
        typicalCounterpart: hasCounterpart ? parseFloat(counterpartPercentage) : undefined,
      },
      team: {
        hasRDDepartment: hasRD,
        rdTeamSize: hasRD ? parseInt(rdTeamSize) : undefined,
        phdCount: parseInt(phdCount) || undefined,
        mastersCount: parseInt(mastersCount) || undefined,
      },
      rdThemes: selectedRDThemes.length > 0 ? selectedRDThemes : undefined,
      projectStage: projectStage as "IDEA" | "PROTOTYPE" | "MVP" | "MARKET_READY" | "SCALE",
      experience: {
        pastGrants: [],
        rdProjects: undefined,
        yearsDoingRD: undefined,
      },
      partnerships: {
        universities: universities.length > 0 ? universities : undefined,
        icts: icts.length > 0 ? icts : undefined,
        embrapiiUnits: embrapiiUnits.length > 0 ? embrapiiUnits : undefined,
      },
      patents: hasPatents ? {
        registered: parseInt(patentCount) || 0,
        pending: parseInt(pendingPatents) || 0,
      } : undefined,
      certifications: selectedCertifications.length > 0 ? selectedCertifications : undefined,
      interests: selectedTechnologies.length > 0 ? selectedTechnologies : undefined,
      impact: selectedSDGs.length > 0 ? {
        odsAlignment: selectedSDGs.map(Number),
      } : undefined,
      preferences: {
        maxCounterpart: maxCounterpart,
        preferredAgencies: undefined,
        priorityThemes: undefined,
      },
    };
  };

  // Save all company data
  const saveCompanyData = async () => {
    try {
      setSaving(true);

      const profileData = buildProfileData();

      const response = await fetch("/api/company/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: companyName,
          legalName,
          sector,
          size,
          description,
          website,
          city,
          state,
          cnaeCode,
          foundationDate: foundationDate || null,
          employeeCount,
          annualRevenue,
          profileData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save company data");
      }

      const data = await response.json();

      if (data.success) {
        alert("Dados salvos com sucesso!");
      }
    } catch (error) {
      console.error("Error saving company data:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Save handlers
  const handleSaveProfile = async () => {
    await saveCompanyData();
  };

  const handleSaveFinancial = async () => {
    await saveCompanyData();
  };

  const handleSavePartnerships = async () => {
    await saveCompanyData();
  };

  const handleSavePreferences = async () => {
    await saveCompanyData();
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
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-4xl">
          <TabsTrigger value="profile">
            <Building2 className="h-4 w-4 mr-2" />
            Perfil & Capacidades
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="partnerships">
            <Users className="h-4 w-4 mr-2" />
            Parcerias
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Sliders className="h-4 w-4 mr-2" />
            Preferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados fundamentais da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O CNPJ não pode ser alterado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome Fantasia</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalName">Razão Social</Label>
                  <Input
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Razão social da empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundationDate">Data de Fundação</Label>
                <Input
                  id="foundationDate"
                  type="date"
                  value={foundationDate}
                  onChange={(e) => setFoundationDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Usada para calcular tempo de operação (alguns grants exigem idade mínima)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Empresa</CardTitle>
              <CardDescription>
                Informações que ajudam no matching com grants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor de Atuação</Label>
                  <select
                    id="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Porte da Empresa</Label>
                  <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {COMPANY_SIZES.map((cs) => (
                      <option key={cs.value} value={cs.value}>{cs.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Empresa</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as atividades e foco da sua empresa"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://exemplo.com.br"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnaeCode">Código CNAE</Label>
                  <Input
                    id="cnaeCode"
                    value={cnaeCode}
                    onChange={(e) => setCnaeCode(e.target.value)}
                    placeholder="0000-0/00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CNAEs - Atividades Econômicas</CardTitle>
              <CardDescription>
                Adicione os CNAEs da sua empresa para matching preciso com editais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Muitos editais especificam CNAEs elegíveis. Adicione o CNAE principal e até 5 secundários para melhorar o matching.
                </p>
              </div>
              <CnaeManager
                cnaes={cnaes}
                onChange={setCnaes}
                maxCnaes={6}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descrição Detalhada</CardTitle>
              <CardDescription>
                Descreva detalhadamente sua empresa para melhor matching automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Sobre a Empresa</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as atividades principais, tecnologias utilizadas, projetos em desenvolvimento, capacidades técnicas e objetivos de inovação da sua empresa. Quanto mais detalhada, melhor o matching automático com grants."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  {description.length} caracteres • Recomendado: 200-1000 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tecnologias e Competências</CardTitle>
              <CardDescription>
                Selecione as tecnologias e áreas técnicas que sua empresa domina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tecnologias</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Clique para selecionar as tecnologias relevantes para sua empresa
                </p>
                <div className="flex flex-wrap gap-2">
                  {TECHNOLOGY_TAGS.map((tech) => (
                    <Badge
                      key={tech}
                      variant={Array.isArray(selectedTechnologies) && selectedTechnologies.includes(tech) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => toggleTechnology(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>P&D e Inovação</CardTitle>
              <CardDescription>
                Informações sobre capacidade de pesquisa e desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Temas de P&D</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione os temas de P&D em que sua empresa atua (importante para FAPESP PIPE e outros)
                </p>
                <div className="flex flex-wrap gap-2">
                  {RD_THEMES.map((theme) => (
                    <Badge
                      key={theme}
                      variant={Array.isArray(selectedRDThemes) && selectedRDThemes.includes(theme) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => toggleRDTheme(theme)}
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectStage">Estágio do Projeto Principal</Label>
                <select
                  id="projectStage"
                  value={projectStage}
                  onChange={(e) => setProjectStage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {PROJECT_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Fase atual do seu principal projeto de inovação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trlLevel">Nível de Maturidade Tecnológica (TRL)</Label>
                <select
                  id="trlLevel"
                  value={trlLevel}
                  onChange={(e) => setTrlLevel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {TRL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Indique o estágio de maturidade da sua principal tecnologia
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hasRD" className="font-medium cursor-pointer">
                    Possui Departamento de P&D?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Equipe dedicada a pesquisa e desenvolvimento
                  </p>
                </div>
                <input
                  id="hasRD"
                  type="checkbox"
                  checked={hasRD}
                  onChange={(e) => setHasRD(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>

              {hasRD && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="rdTeamSize">Tamanho da Equipe P&D</Label>
                    <Input
                      id="rdTeamSize"
                      type="number"
                      value={rdTeamSize}
                      onChange={(e) => setRdTeamSize(e.target.value)}
                      placeholder="8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phdCount">Doutores (PhDs)</Label>
                    <Input
                      id="phdCount"
                      type="number"
                      value={phdCount}
                      onChange={(e) => setPhdCount(e.target.value)}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mastersCount">Mestres</Label>
                    <Input
                      id="mastersCount"
                      type="number"
                      value={mastersCount}
                      onChange={(e) => setMastersCount(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hasPatents" className="font-medium cursor-pointer">
                    Possui Propriedade Intelectual?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Patentes registradas ou pendentes
                  </p>
                </div>
                <input
                  id="hasPatents"
                  type="checkbox"
                  checked={hasPatents}
                  onChange={(e) => setHasPatents(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>

              {hasPatents && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="patentCount">Patentes Registradas</Label>
                    <Input
                      id="patentCount"
                      type="number"
                      value={patentCount}
                      onChange={(e) => setPatentCount(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Número de patentes já concedidas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pendingPatents">Patentes Pendentes</Label>
                    <Input
                      id="pendingPatents"
                      type="number"
                      value={pendingPatents}
                      onChange={(e) => setPendingPatents(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pedidos de patente em tramitação
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capacidade Financeira</CardTitle>
              <CardDescription>
                Informações financeiras da empresa para melhor matching com grants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Número de Funcionários</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    placeholder="25"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total de colaboradores da empresa
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Faturamento Anual (R$)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    placeholder="1500000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Faturamento bruto anual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investimento em P&D</CardTitle>
              <CardDescription>
                Capacidade de investimento em pesquisa e desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rdBudget">Orçamento Anual P&D (R$)</Label>
                  <Input
                    id="rdBudget"
                    type="number"
                    value={rdBudget}
                    onChange={(e) => setRdBudget(e.target.value)}
                    placeholder="150000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Investimento anual em P&D
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rdPercentage">% do Faturamento em P&D</Label>
                  <Input
                    id="rdPercentage"
                    type="number"
                    value={rdPercentage}
                    onChange={(e) => setRdPercentage(e.target.value)}
                    placeholder="10"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual do faturamento investido em P&D
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capacidade de Contrapartida</CardTitle>
              <CardDescription>
                Recursos que a empresa pode comprometer como contrapartida em grants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hasCounterpart" className="font-medium cursor-pointer">
                    Pode Oferecer Contrapartida?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Capacidade de investir recursos próprios no projeto
                  </p>
                </div>
                <input
                  id="hasCounterpart"
                  type="checkbox"
                  checked={hasCounterpart}
                  onChange={(e) => setHasCounterpart(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>

              {hasCounterpart && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="counterpartPercentage">% de Contrapartida</Label>
                    <Input
                      id="counterpartPercentage"
                      type="number"
                      value={counterpartPercentage}
                      onChange={(e) => setCounterpartPercentage(e.target.value)}
                      placeholder="20"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentual que pode comprometer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCounterpartValue">Valor Máximo (R$)</Label>
                    <Input
                      id="maxCounterpartValue"
                      type="number"
                      value={maxCounterpartValue}
                      onChange={(e) => setMaxCounterpartValue(e.target.value)}
                      placeholder="300000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor máximo de contrapartida
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faixa de Projeto</CardTitle>
              <CardDescription>
                Valores mínimos e máximos de projetos que a empresa pode executar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minProjectValue">Valor Mínimo do Projeto (R$)</Label>
                  <Input
                    id="minProjectValue"
                    type="number"
                    value={minProjectValue}
                    onChange={(e) => setMinProjectValue(e.target.value)}
                    placeholder="100000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Menor projeto que pode gerenciar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxProjectValue">Valor Máximo do Projeto (R$)</Label>
                  <Input
                    id="maxProjectValue"
                    type="number"
                    value={maxProjectValue}
                    onChange={(e) => setMaxProjectValue(e.target.value)}
                    placeholder="1000000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maior projeto que pode executar
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveFinancial} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parcerias Acadêmicas</CardTitle>
              <CardDescription>
                Parcerias com universidades e instituições de pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universities">Universidades Parceiras</Label>
                <Input
                  id="universities"
                  value={universities.join(", ")}
                  onChange={(e) => setUniversities(e.target.value.split(",").map(u => u.trim()).filter(Boolean))}
                  placeholder="USP, UNICAMP, UNESP"
                />
                <p className="text-xs text-muted-foreground">
                  Separe por vírgula. Ex: USP, UNICAMP, UNESP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icts">ICTs Parceiras</Label>
                <Input
                  id="icts"
                  value={icts.join(", ")}
                  onChange={(e) => setIcts(e.target.value.split(",").map(i => i.trim()).filter(Boolean))}
                  placeholder="Instituto de Pesquisa A, Centro B"
                />
                <p className="text-xs text-muted-foreground">
                  Instituições de Ciência e Tecnologia parceiras
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embrapiiUnits">Unidades EMBRAPII</Label>
                <Input
                  id="embrapiiUnits"
                  value={embrapiiUnits.join(", ")}
                  onChange={(e) => setEmbrapiiUnits(e.target.value.split(",").map(e => e.trim()).filter(Boolean))}
                  placeholder="Unidade EMBRAPII tal"
                />
                <p className="text-xs text-muted-foreground">
                  Unidades EMBRAPII com as quais tem parceria
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="openToPartnerships" className="font-medium cursor-pointer">
                    Aberto a Novas Parcerias
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Interesse em formar novas parcerias acadêmicas
                  </p>
                </div>
                <input
                  id="openToPartnerships"
                  type="checkbox"
                  checked={openToPartnerships}
                  onChange={(e) => setOpenToPartnerships(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
              <CardDescription>
                Certificações de qualidade, segurança e responsabilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Certificações da Empresa</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione as certificações que sua empresa possui
                </p>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <Badge
                      key={cert}
                      variant={Array.isArray(selectedCertifications) && selectedCertifications.includes(cert) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => toggleCertification(cert)}
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivos de Desenvolvimento Sustentável (ODS)</CardTitle>
              <CardDescription>
                ODS da ONU que a empresa contribui ou tem interesse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ODS Alinhadas</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione os Objetivos de Desenvolvimento Sustentável alinhados à sua empresa
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SDG_LIST.map((sdg) => (
                    <div
                      key={sdg.value}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent ${
                        Array.isArray(selectedSDGs) && selectedSDGs.includes(sdg.value) ? "bg-accent" : ""
                      }`}
                      onClick={() => toggleSDG(sdg.value)}
                    >
                      <Label className="cursor-pointer text-sm">{sdg.label}</Label>
                      <input
                        type="checkbox"
                        checked={Array.isArray(selectedSDGs) && selectedSDGs.includes(sdg.value)}
                        onChange={() => toggleSDG(sdg.value)}
                        className="h-4 w-4 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiência com Grants</CardTitle>
              <CardDescription>
                Histórico de participação em grants e financiamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hasPastGrants" className="font-medium cursor-pointer">
                    Já Recebeu Grants Anteriormente?
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Histórico de aprovação em editais de fomento
                  </p>
                </div>
                <input
                  id="hasPastGrants"
                  type="checkbox"
                  checked={hasPastGrants}
                  onChange={(e) => setHasPastGrants(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePartnerships} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Matching Automático
                </div>
              </CardTitle>
              <CardDescription>
                Configure como o sistema encontra oportunidades automaticamente para você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Filosofia de Matching Automático:</strong> O sistema analisa TODAS as oportunidades
                  disponíveis e apresenta aquelas com maior sinergia com sua empresa, baseado nos dados
                  estratégicos que você forneceu (tecnologias, capacidades, P&D, financeiro, parcerias).
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-match" className="font-medium cursor-pointer">
                    Busca Automática Ativa
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sistema busca automaticamente grants compatíveis 24/7
                  </p>
                </div>
                <input
                  id="auto-match"
                  type="checkbox"
                  checked={autoMatch}
                  onChange={(e) => setAutoMatch(e.target.checked)}
                  className="h-5 w-5 rounded cursor-pointer"
                />
              </div>

              {autoMatch && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div>
                    <Label htmlFor="min-match-score" className="font-medium">
                      Score Mínimo de Compatibilidade
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mostrar apenas grants com score de compatibilidade acima deste valor (recomendado: 60-70%)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      id="min-match-score"
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={minMatchScore}
                      onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="w-16 text-center">
                      <span className="text-2xl font-bold">{minMatchScore}</span>
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências de Financiamento</CardTitle>
              <CardDescription>
                Tipos de grants de interesse (não limita matching, apenas prioriza)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipos de Grant Preferidos</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione os tipos de financiamento de maior interesse
                </p>
                <div className="space-y-2">
                  {GRANT_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent ${
                        Array.isArray(selectedGrantTypes) && selectedGrantTypes.includes(type.value) ? "bg-accent" : ""
                      }`}
                      onClick={() => toggleGrantType(type.value)}
                    >
                      <Label className="cursor-pointer">{type.label}</Label>
                      <input
                        type="checkbox"
                        checked={Array.isArray(selectedGrantTypes) && selectedGrantTypes.includes(type.value)}
                        onChange={() => toggleGrantType(type.value)}
                        className="h-4 w-4 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-counterpart">Contrapartida Máxima Aceitável (%)</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="max-counterpart"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={maxCounterpart}
                    onChange={(e) => setMaxCounterpart(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <span className="text-xl font-bold">{maxCounterpart}</span>
                    <span className="text-sm">%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentual máximo de contrapartida que está disposto a oferecer
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber atualizações sobre grants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber atualizações importantes por email
                    </p>
                  </div>
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({ ...notifications, email: e.target.checked })
                    }
                    className="h-5 w-5 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="deadline-alerts" className="font-medium cursor-pointer">
                      Alertas de Prazo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Avisos quando grants estão próximos do prazo final
                    </p>
                  </div>
                  <input
                    id="deadline-alerts"
                    type="checkbox"
                    checked={notifications.deadlineAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, deadlineAlerts: e.target.checked })
                    }
                    className="h-5 w-5 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-matches" className="font-medium cursor-pointer">
                      Novos Matches
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando novos grants compatíveis forem encontrados
                    </p>
                  </div>
                  <input
                    id="new-matches"
                    type="checkbox"
                    checked={notifications.newMatches}
                    onChange={(e) =>
                      setNotifications({ ...notifications, newMatches: e.target.checked })
                    }
                    className="h-5 w-5 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest" className="font-medium cursor-pointer">
                      Resumo Semanal
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber email semanal com resumo de oportunidades
                    </p>
                  </div>
                  <input
                    id="weekly-digest"
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={(e) =>
                      setNotifications({ ...notifications, weeklyDigest: e.target.checked })
                    }
                    className="h-5 w-5 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePreferences} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
