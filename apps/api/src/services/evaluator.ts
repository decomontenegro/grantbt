import { prisma } from "@grantbr/database";
import { generateText } from "../lib/openai";

interface EvaluationResult {
  overallScore: number;
  criteriaScores: {
    innovation: number;
    feasibility: number;
    impact: number;
    team: number;
    budget: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  passesThreshold: boolean;
}

/**
 * EVALUATOR AGENT
 * Simulates grant evaluator to score proposals and provide feedback
 */
export async function evaluateProposal(applicationId: string): Promise<EvaluationResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      company: true,
      grant: true,
    },
  });

  if (!application || !application.draftContent) {
    throw new Error("Application or draft content not found");
  }

  const { grant, draftContent } = application;

  // Evaluate each criterion
  const criteriaScores = {
    innovation: await evaluateCriterion("Innovation and Novelty", draftContent, grant),
    feasibility: await evaluateCriterion("Technical Feasibility", draftContent, grant),
    impact: await evaluateCriterion("Expected Impact", draftContent, grant),
    team: await evaluateCriterion("Team Capability", draftContent, grant),
    budget: await evaluateCriterion("Budget Adequacy", draftContent, grant),
  };

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (criteriaScores.innovation * 0.3 +
     criteriaScores.feasibility * 0.25 +
     criteriaScores.impact * 0.25 +
     criteriaScores.team * 0.1 +
     criteriaScores.budget * 0.1)
  );

  // Generate feedback
  const feedback = await generateFeedback(draftContent, grant, criteriaScores, overallScore);

  // Update application with evaluation
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      evaluationScore: overallScore,
      evaluationFeedback: JSON.stringify(feedback),
    },
  });

  return {
    overallScore,
    criteriaScores,
    strengths: feedback.strengths,
    weaknesses: feedback.weaknesses,
    suggestions: feedback.suggestions,
    passesThreshold: overallScore >= 70, // Typical passing score
  };
}

async function evaluateCriterion(
  criterionName: string,
  draftContent: any,
  grant: any
): Promise<number> {
  const systemPrompt = `You are an expert grant evaluator for ${grant.agency}.
Evaluate the "${criterionName}" criterion of this proposal.
Give a score from 0 to 100, where:
- 90-100: Excellent
- 75-89: Very Good
- 60-74: Good
- 40-59: Fair
- 0-39: Poor

Respond with ONLY a number between 0 and 100.`;

  const proposalText = JSON.stringify(draftContent);

  const userPrompt = `Evaluate the "${criterionName}" of this grant proposal:

Grant: ${grant.title}
Category: ${grant.category}

Proposal Content:
${proposalText.substring(0, 2000)}...

Score (0-100):`;

  const response = await generateText(systemPrompt, userPrompt, "gpt-3.5-turbo");

  // Extract number from response
  const score = parseInt(response.match(/\d+/)?.[0] || "50");

  return Math.min(100, Math.max(0, score));
}

async function generateFeedback(
  draftContent: any,
  grant: any,
  scores: any,
  overallScore: number
): Promise<{ strengths: string[]; weaknesses: string[]; suggestions: string[] }> {
  const systemPrompt = `You are an expert grant reviewer providing constructive feedback.
Analyze this proposal and provide:
1. 3-5 key strengths
2. 3-5 areas for improvement
3. 3-5 specific suggestions to improve the proposal

Be specific and actionable. Write in Portuguese (Brazilian).`;

  const proposalText = JSON.stringify(draftContent);

  const userPrompt = `Proposal Evaluation:
Overall Score: ${overallScore}/100

Criterion Scores:
- Innovation: ${scores.innovation}/100
- Feasibility: ${scores.feasibility}/100
- Impact: ${scores.impact}/100
- Team: ${scores.team}/100
- Budget: ${scores.budget}/100

Proposal:
${proposalText.substring(0, 3000)}

Provide feedback in this exact JSON format:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;

  const response = await generateText(systemPrompt, userPrompt);

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse feedback JSON:", error);
  }

  // Fallback
  return {
    strengths: ["Proposta bem estruturada"],
    weaknesses: ["Alguns pontos precisam de mais detalhamento"],
    suggestions: ["Revisar e expandir seções principais"],
  };
}
