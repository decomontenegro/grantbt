import { prisma } from "@grantbr/database";
import { generateEmbedding } from "../lib/openai";

export async function generateEntityEmbedding(type: string, entityId: string) {
  console.log(`Generating embedding for ${type}:${entityId}...`);

  switch (type) {
    case "company":
      return await generateCompanyEmbedding(entityId);
    case "project":
      return await generateProjectEmbedding(entityId);
    case "grant":
      return await generateGrantEmbedding(entityId);
    default:
      throw new Error(`Unknown entity type: ${type}`);
  }
}

async function generateCompanyEmbedding(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { projects: true },
  });

  if (!company) throw new Error("Company not found");

  // Build text representation
  let text = `${company.name}. ${company.description}. Setor: ${company.sector}.`;

  if (company.projects && company.projects.length > 0) {
    text += " Projetos: ";
    text += company.projects.map((p) => `${p.title}: ${p.description}`).join(". ");
  }

  const profileData = company.profileData as any || {};
  if (profileData.interests) {
    text += ` Áreas de interesse: ${profileData.interests.join(", ")}.`;
  }

  // Generate embedding
  const embedding = await generateEmbedding(text);

  // Update company
  await prisma.company.update({
    where: { id: companyId },
    data: { embedding },
  });

  return { success: true };
}

async function generateProjectEmbedding(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  const text = `${project.title}. ${project.description}`;
  const embedding = await generateEmbedding(text);

  await prisma.project.update({
    where: { id: projectId },
    data: { embedding },
  });

  return { success: true };
}

async function generateGrantEmbedding(grantId: string) {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) throw new Error("Grant not found");

  const text = `${grant.title}. ${grant.description}. Agência: ${grant.agency}. Categoria: ${grant.category}.`;
  const embedding = await generateEmbedding(text);

  await prisma.grant.update({
    where: { id: grantId },
    data: { embedding },
  });

  return { success: true };
}
