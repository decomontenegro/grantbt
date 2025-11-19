import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cnae/search
 * Busca CNAEs na API do IBGE
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ cnaes: [] });
    }

    // API pública do IBGE
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v2/cnae/classes"
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar CNAEs");
    }

    const allCnaes = await response.json();

    // Filtrar por query (código ou descrição)
    const filtered = allCnaes
      .filter((cnae: any) => {
        const searchLower = query.toLowerCase();
        const code = (cnae.id || "").toString();
        const desc = (cnae.descricao || "").toLowerCase();

        return (
          code.includes(query) ||
          desc.includes(searchLower)
        );
      })
      .slice(0, 20) // Limitar a 20 resultados
      .map((cnae: any) => ({
        code: cnae.id,
        description: cnae.descricao,
      }));

    return NextResponse.json({ cnaes: filtered });
  } catch (error: any) {
    console.error("Erro ao buscar CNAEs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar CNAEs", details: error.message },
      { status: 500 }
    );
  }
}
