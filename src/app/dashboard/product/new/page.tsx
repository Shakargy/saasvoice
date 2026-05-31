import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getProductProfile } from "@/lib/queries";

// Profile creation lives in the guided onboarding wizard now.
export default async function NewProductPage() {
  const session = await auth();
  const existing = await getProductProfile(session!.user.id);
  redirect(existing ? "/dashboard/product" : "/dashboard/onboarding");
}
