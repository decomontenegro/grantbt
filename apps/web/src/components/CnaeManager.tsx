"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, X, Star, Loader2 } from "lucide-react";

interface Cnae {
  code: string;
  description: string;
  isPrimary: boolean;
}

interface CnaeSearchResult {
  code: string;
  description: string;
}

interface CnaeManagerProps {
  cnaes: Cnae[];
  onChange: (cnaes: Cnae[]) => void;
  maxCnaes?: number;
}

export function CnaeManager({ cnaes, onChange, maxCnaes = 6 }: CnaeManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CnaeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCnaes(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchCnaes = async (query: string) => {
    setSearching(true);
    try {
      const response = await fetch(`/api/cnae/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.cnaes || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erro ao buscar CNAEs:", error);
    } finally {
      setSearching(false);
    }
  };

  const addCnae = (result: CnaeSearchResult) => {
    // Verifica se já existe
    if (cnaes.some(c => c.code === result.code)) {
      return;
    }

    // Verifica limite
    if (cnaes.length >= maxCnaes) {
      alert(`Você pode adicionar no máximo ${maxCnaes} CNAEs`);
      return;
    }

    const newCnae: Cnae = {
      code: result.code,
      description: result.description,
      isPrimary: cnaes.length === 0, // Primeiro CNAE é automaticamente primário
    };

    onChange([...cnaes, newCnae]);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const removeCnae = (code: string) => {
    const filtered = cnaes.filter(c => c.code !== code);

    // Se removeu o primário e ainda tem CNAEs, marca o primeiro como primário
    if (cnaes.find(c => c.code === code)?.isPrimary && filtered.length > 0) {
      filtered[0].isPrimary = true;
    }

    onChange(filtered);
  };

  const setPrimary = (code: string) => {
    const updated = cnaes.map(c => ({
      ...c,
      isPrimary: c.code === code,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar CNAE por código ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {searchResults.map((result) => (
                <button
                  key={result.code}
                  onClick={() => addCnae(result)}
                  disabled={cnaes.some(c => c.code === result.code)}
                  className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {result.code}
                  </div>
                  <div className="text-sm">{result.description}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {showResults && searchResults.length === 0 && !searching && (
          <Card className="absolute z-10 w-full mt-1">
            <CardContent className="p-4 text-center text-sm text-gray-500">
              Nenhum CNAE encontrado
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected CNAEs */}
      {cnaes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CNAEs Adicionados ({cnaes.length}/{maxCnaes})
          </div>
          {cnaes.map((cnae) => (
            <Card key={cnae.code} className={cnae.isPrimary ? "border-blue-500 border-2" : ""}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {cnae.code}
                      </code>
                      {cnae.isPrimary && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {cnae.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!cnae.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimary(cnae.code)}
                        title="Marcar como principal"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCnae(cnae.code)}
                      title="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {cnaes.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          Nenhum CNAE adicionado. Use a busca acima para adicionar.
        </div>
      )}
    </div>
  );
}
