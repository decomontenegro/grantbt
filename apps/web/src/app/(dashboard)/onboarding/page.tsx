"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

import { Step1BasicInfo } from "@/components/onboarding/step-1-basic-info";
import { Step2CompanyDetails } from "@/components/onboarding/step-2-company-details";
import { Step3Projects } from "@/components/onboarding/step-3-projects";
import { Step4Interests } from "@/components/onboarding/step-4-interests";
import { Step5History } from "@/components/onboarding/step-5-history";
import { Step6Team } from "@/components/onboarding/step-6-team";
import { Step7Preferences } from "@/components/onboarding/step-7-preferences";
import { Step8Review } from "@/components/onboarding/step-8-review";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async (finalData: any) => {
    setLoading(true);
    const completeData = { ...formData, ...finalData };

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) throw new Error("Failed to complete onboarding");

      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Erro ao finalizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const commonProps = {
      data: formData,
      onNext: handleNext,
      onBack: handleBack,
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...commonProps} />;
      case 2:
        return <Step2CompanyDetails {...commonProps} />;
      case 3:
        return <Step3Projects {...commonProps} />;
      case 4:
        return <Step4Interests {...commonProps} />;
      case 5:
        return <Step5History {...commonProps} />;
      case 6:
        return <Step6Team {...commonProps} />;
      case 7:
        return <Step7Preferences {...commonProps} />;
      case 8:
        return <Step8Review {...commonProps} data={formData} onFinish={handleFinish} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 p-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">GrantBR</span>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Bem-vindo ao GrantBR!</h1>
          <p className="text-muted-foreground">
            Vamos configurar seu perfil para encontrar as melhores oportunidades de financiamento
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Etapa {currentStep} de {TOTAL_STEPS}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  );
}
