import { prisma } from "@/lib/db";

/** Fetch a post only if it belongs to the user. Returns null otherwise. */
export async function getOwnedPost(id: string, userId: string) {
  const post = await prisma.generatedPost.findUnique({ where: { id } });
  if (!post || post.userId !== userId) return null;
  return post;
}
