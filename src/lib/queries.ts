import { prisma } from "@/lib/db";

/** The single product profile for a user (MVP allows one). */
export function getProductProfile(userId: string) {
  return prisma.productProfile.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export function getProductUpdates(userId: string) {
  return prisma.productUpdate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
