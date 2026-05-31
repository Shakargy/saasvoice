import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getProductProfile } from "@/lib/queries";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";

export const metadata: Metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const session = await auth();
  const profile = await getProductProfile(session!.user.id);
  // If they already have a product, onboarding is done.
  if (profile) redirect("/dashboard");

  return <OnboardingWizard />;
}
