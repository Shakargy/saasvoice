import { describe, it, expect } from "vitest";

import { parseRepo, guessUpdateType } from "./github";

describe("parseRepo", () => {
  it("parses full https URLs", () => {
    expect(parseRepo("https://github.com/Shakargy/saasvoice")).toEqual({
      owner: "Shakargy",
      repo: "saasvoice",
    });
  });

  it("parses github.com without protocol", () => {
    expect(parseRepo("github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("parses owner/repo shorthand", () => {
    expect(parseRepo("facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });

  it("strips a trailing .git and slashes", () => {
    expect(parseRepo("https://github.com/owner/repo.git/")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("ignores extra path segments (tree/branch)", () => {
    expect(parseRepo("https://github.com/owner/repo/tree/main")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  it("rejects junk", () => {
    expect(parseRepo("")).toBeNull();
    expect(parseRepo("not a repo")).toBeNull();
    expect(parseRepo("https://gitlab.com/owner/repo")).toBeNull();
    expect(parseRepo("justowner")).toBeNull();
  });
});

describe("guessUpdateType", () => {
  it("maps fixes", () => {
    expect(guessUpdateType("fix: handle null user in session")).toBe("Bug fixed");
    expect(guessUpdateType("Fixed the webhook retry bug")).toBe("Bug fixed");
  });

  it("maps features", () => {
    expect(guessUpdateType("feat: add zombie API detection")).toBe("Feature shipped");
    expect(guessUpdateType("Add CSV export")).toBe("Feature shipped");
  });

  it("maps performance/refactor to technical decision", () => {
    expect(guessUpdateType("perf: cache the dashboard summary")).toBe("Technical decision");
    expect(guessUpdateType("refactor: split the auth config")).toBe("Technical decision");
  });

  it("maps releases to launch", () => {
    expect(guessUpdateType("release v1.2.0")).toBe("Launch");
  });

  it("falls back to feature shipped", () => {
    expect(guessUpdateType("misc tweaks")).toBe("Feature shipped");
  });
});
