"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface Step7Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step7Preferences({ data, onNext, onBack }: Step7Props) {
  const [notifications, setNotifications] = useState({
    email: data.emailNotifications ?? true,
    deadlineAlerts: data.deadlineAlerts ?? true,
    newMatches: data.newMatches ?? true,
    weeklyDigest: data.weeklyDigest ?? false,
  });

  const [autoMatch, setAutoMatch] = useState(data.autoMatch ?? true);
  const [minMatchScore, setMinMatchScore] = useState(data.minMatchScore || "70");

  const handleNext = () => {
    onNext({
      emailNotifications: notifications.email,
      deadlineAlerts: notifications.deadlineAlerts,
      newMatches: notifications.newMatches,
      weeklyDigest: notifications.weeklyDigest,
      autoMatch,
      minMatchScore: parseInt(minMatchScore),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Settings className="h-5 w-5" />
          <span className="font-semibold">Preferências</span>
        </div>
        <CardTitle>Configure suas preferências</CardTitle>
        <CardDescription>
          Personalize como você deseja receber informações e recomendações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Notificações</Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Notificações por Email</div>
                <div className="text-sm text-muted-foreground">
                  Receber atualizações importantes por email
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) =>
                  setNotifications({ ...notifications, email: e.target.checked })
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Alertas de Prazo</div>
                <div className="text-sm text-muted-foreground">
                  Avisos quando grants estão próximos do prazo final
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.deadlineAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, deadlineAlerts: e.target.checked })
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Novos Matches</div>
                <div className="text-sm text-muted-foreground">
                  Notificar quando novos grants compatíveis forem encontrados
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.newMatches}
                onChange={(e) =>
                  setNotifications({ ...notifications, newMatches: e.target.checked })
                }
                className="h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Resumo Semanal</div>
                <div className="text-sm text-muted-foreground">
                  Receber email semanal com resumo de oportunidades
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) =>
                  setNotifications({ ...notifications, weeklyDigest: e.target.checked })
                }
                className="h-4 w-4 rounded"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Matching Automático</Label>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">Busca Automática</div>
              <div className="text-sm text-muted-foreground">
                Sistema busca automaticamente grants compatíveis 24/7
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoMatch}
              onChange={(e) => setAutoMatch(e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          {autoMatch && (
            <div className="space-y-2 rounded-lg border p-3">
              <Label>Score Mínimo de Compatibilidade</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(e.target.value)}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">{minMatchScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Mostrar apenas grants com score de compatibilidade acima deste valor
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
