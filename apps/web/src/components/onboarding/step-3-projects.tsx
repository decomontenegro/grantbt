"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Plus, X } from "lucide-react";

interface Step3Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

interface Project {
  title: string;
  description: string;
  budget: string;
  status: string;
}

export function Step3Projects({ data, onNext, onBack }: Step3Props) {
  const [projects, setProjects] = useState<Project[]>(
    data.projects || [{ title: "", description: "", budget: "", status: "planning" }]
  );

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", budget: "", status: "planning" }]);
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleNext = () => {
    const validProjects = projects.filter((p) => p.title && p.description);
    if (validProjects.length === 0) {
      alert("Adicione pelo menos um projeto");
      return;
    }
    onNext({ projects: validProjects });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Rocket className="h-5 w-5" />
          <span className="font-semibold">Projetos</span>
        </div>
        <CardTitle>Quais projetos você quer financiar?</CardTitle>
        <CardDescription>
          Descreva os projetos de P&D ou inovação que você pretende desenvolver.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Projeto {index + 1}</span>
              {projects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título do Projeto</Label>
              <Input
                placeholder="Ex: Desenvolvimento de plataforma de IA"
                value={project.title}
                onChange={(e) => updateProject(index, "title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Descreva brevemente o projeto, seus objetivos e benefícios..."
                value={project.description}
                onChange={(e) => updateProject(index, "description", e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Orçamento Estimado (R$)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 500000"
                  value={project.budget}
                  onChange={(e) => updateProject(index, "budget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={project.status}
                  onChange={(e) => updateProject(index, "status", e.target.value)}
                >
                  <option value="planning">Planejamento</option>
                  <option value="execution">Em Execução</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addProject} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Outro Projeto
        </Button>

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
