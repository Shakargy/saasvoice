import { z } from "zod";

import type { UpdateType } from "@/lib/constants";

/**
 * Parse a GitHub repo reference into { owner, repo }. Accepts:
 *   - https://github.com/owner/repo
 *   - github.com/owner/repo(.git)
 *   - owner/repo
 * Returns null if it doesn't look like a repo reference.
 */
export function parseRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let path = trimmed;
  // Strip a URL prefix if present.
  const urlMatch = trimmed.match(/github\.com[/:]([^?#]+)/i);
  if (urlMatch) {
    path = urlMatch[1];
  }

  path = path.replace(/^\/+|\/+$/g, "");
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  // GitHub owner/repo name charset.
  const ok = /^[\w.-]+$/.test(owner) && /^[\w.-]+$/.test(repo);
  if (!ok) return null;

  return { owner, repo };
}

/** A trimmed commit shape we expose to the client. */
export const commitSchema = z.object({
  sha: z.string(),
  shortSha: z.string(),
  message: z.string(),
  title: z.string(),
  author: z.string().nullable(),
  date: z.string().nullable(),
  url: z.string(),
});

export type Commit = z.infer<typeof commitSchema>;

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: { name?: string; date?: string } | null;
  };
  author?: { login?: string } | null;
};

/**
 * Fetch recent commits from a PUBLIC repo via the unauthenticated GitHub API.
 * No token — so it's rate limited (~60 req/hr/IP) and only works on public
 * repos. Private-repo support is a future OAuth (premium) feature.
 */
export async function fetchPublicCommits(
  owner: string,
  repo: string,
  perPage = 15
): Promise<{ ok: true; commits: Commit[] } | { ok: false; error: string; status: number }> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "SaaSVoice",
      },
      // Cache briefly to be kind to the rate limit.
      next: { revalidate: 60 },
    });
  } catch {
    return { ok: false, error: "Couldn't reach GitHub. Try again.", status: 502 };
  }

  if (res.status === 404) {
    return { ok: false, error: "Repo not found, or it's private.", status: 404 };
  }
  if (res.status === 403) {
    return {
      ok: false,
      error: "GitHub rate limit hit. Wait a bit and try again.",
      status: 429,
    };
  }
  if (!res.ok) {
    return { ok: false, error: "GitHub request failed.", status: 502 };
  }

  const data = (await res.json()) as GithubCommit[];
  const commits: Commit[] = data
    .filter((c) => c?.commit?.message)
    .map((c) => {
      const message = c.commit.message.trim();
      const title = message.split("\n")[0].slice(0, 160);
      return {
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message,
        title,
        author: c.commit.author?.name ?? c.author?.login ?? null,
        date: c.commit.author?.date ?? null,
        url: c.html_url,
      };
    });

  return { ok: true, commits };
}

/** Heuristic: guess an update type from a (conventional) commit message. */
export function guessUpdateType(message: string): UpdateType {
  const m = message.toLowerCase();
  if (/^fix|^bugfix|\bfix(ed|es)?\b|\bbug\b/.test(m)) return "Bug fixed";
  if (/^feat|\bfeature\b|\badd(ed|s)?\b|\bship(ped)?\b/.test(m)) return "Feature shipped";
  if (/^perf|\bperformance\b|\bspeed\b|\bfaster\b|\boptimiz/.test(m)) return "Technical decision";
  if (/^refactor|^chore|\brefactor\b/.test(m)) return "Technical decision";
  if (/^docs?\b|\bchangelog\b/.test(m)) return "Changelog";
  if (/^release|\bv?\d+\.\d+\.\d+/.test(m)) return "Launch";
  return "Feature shipped";
}
