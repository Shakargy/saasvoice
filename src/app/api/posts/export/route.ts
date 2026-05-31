import { prisma } from "@/lib/db";
import { requireUserId, UnauthorizedError } from "@/lib/api";

/** CSV-escape a single field. */
function csv(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return new Response("Unauthorized", { status: 401 });
    }
    throw err;
  }

  const posts = await prisma.generatedPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "variant",
    "platform",
    "status",
    "humanScore",
    "aiGenericScore",
    "characters",
    "hook",
    "text",
    "hashtags",
    "plannedAt",
    "createdAt",
  ];

  const rows = posts.map((p) =>
    [
      p.variantName,
      p.platform,
      p.status,
      p.humanScore,
      p.aiGenericScore,
      p.estimatedCharacters,
      p.hook,
      p.text,
      Array.isArray(p.hashtags) ? (p.hashtags as string[]).join(" ") : "",
      p.plannedAt ? p.plannedAt.toISOString() : "",
      p.createdAt.toISOString(),
    ]
      .map(csv)
      .join(",")
  );

  const body = [header.join(","), ...rows].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="saasvoice-posts.csv"`,
    },
  });
}
