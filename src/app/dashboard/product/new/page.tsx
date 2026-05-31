import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getProductProfile } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductProfileForm } from "@/components/forms/product-profile-form";

export const metadata: Metadata = { title: "New product profile" };

export default async function NewProductPage() {
  const session = await auth();
  const existing = await getProductProfile(session!.user.id);
  // One profile per user in the MVP.
  if (existing) redirect("/dashboard/product");

  return (
    <>
      <PageHeader
        title="Create product profile"
        description="Tell SaaSVoice what you're building."
      />
      <Card>
        <CardContent>
          <ProductProfileForm />
        </CardContent>
      </Card>
    </>
  );
}
