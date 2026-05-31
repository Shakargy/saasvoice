import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getProductProfile } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductProfileForm } from "@/components/forms/product-profile-form";
import type { ProductProfileFormValues } from "@/lib/validators/product-profile";

export const metadata: Metadata = { title: "Edit product profile" };

export default async function EditProductPage() {
  const session = await auth();
  const profile = await getProductProfile(session!.user.id);
  if (!profile) redirect("/dashboard/product/new");

  const initial = {
    id: profile.id,
    productName: profile.productName,
    websiteUrl: profile.websiteUrl ?? "",
    shortDescription: profile.shortDescription,
    targetAudience: profile.targetAudience,
    category: profile.category,
    founderTone: profile.founderTone,
    writingStyleNotes: profile.writingStyleNotes ?? "",
    bannedWords: profile.bannedWords ?? "",
    preferredPostLength: profile.preferredPostLength,
    defaultPlatform: profile.defaultPlatform,
  } as ProductProfileFormValues & { id: string };

  return (
    <>
      <PageHeader title="Edit product profile" />
      <Card>
        <CardContent>
          <ProductProfileForm initial={initial} />
        </CardContent>
      </Card>
    </>
  );
}
