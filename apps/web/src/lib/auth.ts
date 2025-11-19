import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@grantbr/database";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getUserCompanies(userId: string) {
  const memberships = await prisma.companyMember.findMany({
    where: { userId },
    include: {
      company: true,
    },
  });
  return memberships.map((m) => m.company);
}

export async function requireCompanyAccess(userId: string, companyId: string) {
  const member = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!member) {
    throw new Error("Forbidden: No access to this company");
  }

  return member;
}
