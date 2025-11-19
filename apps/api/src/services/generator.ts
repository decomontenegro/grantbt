import { prisma } from "@grantbr/database";
import { generateText } from "../lib/openai";

/**
 * PROPOSAL GENERATOR AGENT
 * Generates grant proposals using RAG (Retrieval-Augmented Generation)
 */
export async function generateProposal(applicationId: string): Promise<any> {
  // Get application with related data
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      company: {
        include: {
          projects: true,
        },
      },
      grant: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const { company, grant } = application;

  // Build context for generation
  const context = buildProposalContext(company, grant);

  // Generate each section
  const proposal = {
    executiveSummary: await generateSection("Executive Summary", context, grant),
    problem: await generateSection("Problem Statement", context, grant),
    solution: await generateSection("Proposed Solution", context, grant),
    methodology: await generateSection("Methodology", context, grant),
    timeline: await generateSection("Project Timeline", context, grant),
    budget: await generateSection("Budget Breakdown", context, grant),
    team: await generateSection("Team Qualifications", context, grant),
    impact: await generateSection("Expected Impact", context, grant),
  };

  // Update application with generated content
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      draftContent: proposal,
    },
  });

  return proposal;
}

function buildProposalContext(company: any, grant: any): string {
  let context = `Company: ${company.name}\n`;
  context += `Sector: ${company.sector}\n`;
  context += `Description: ${company.description}\n\n`;

  context += `Grant: ${grant.title}\n`;
  context += `Agency: ${grant.agency}\n`;
  context += `Description: ${grant.description}\n\n`;

  if (company.projects && company.projects.length > 0) {
    context += `Company Projects:\n`;
    company.projects.forEach((p: any) => {
      context += `- ${p.title}: ${p.description}\n`;
    });
  }

  return context;
}

async function generateSection(sectionName: string, context: string, grant: any): Promise<string> {
  const systemPrompt = `You are an expert grant writer specializing in Brazilian and European funding programs.
Your task is to write the "${sectionName}" section of a grant proposal.

Guidelines:
- Write in Portuguese (Brazilian)
- Be specific and use concrete examples
- Align with the grant's objectives
- Use professional, formal language
- Focus on innovation and impact
- Keep it concise but comprehensive (300-500 words)`;

  const userPrompt = `Write the "${sectionName}" section for this grant proposal:

${context}

Grant Focus: ${grant.category || "Innovation"}
Grant Value Range: R$ ${grant.valueMin?.toLocaleString()} - R$ ${grant.valueMax?.toLocaleString()}

Write the section now:`;

  return await generateText(systemPrompt, userPrompt);
}
