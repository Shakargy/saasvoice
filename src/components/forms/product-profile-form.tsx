"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  productProfileSchema,
  type ProductProfileInput,
  type ProductProfileFormValues,
} from "@/lib/validators/product-profile";
import {
  PRODUCT_CATEGORIES,
  FOUNDER_TONES,
  POST_LENGTHS,
  PLATFORMS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "./field";

type ProfileRecord = ProductProfileFormValues & { id: string };

export function ProductProfileForm({
  initial,
  onCreated,
  embedded,
}: {
  initial?: ProfileRecord | null;
  /** Called after a successful create (used by the onboarding wizard). */
  onCreated?: () => void;
  /** When true, skip navigation and let the parent drive next steps. */
  embedded?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductProfileFormValues, unknown, ProductProfileInput>({
    resolver: zodResolver(productProfileSchema),
    defaultValues: {
      productName: initial?.productName ?? "",
      websiteUrl: initial?.websiteUrl ?? "",
      shortDescription: initial?.shortDescription ?? "",
      targetAudience: initial?.targetAudience ?? "",
      category: initial?.category ?? "SaaS",
      founderTone: initial?.founderTone ?? "Technical founder",
      writingStyleNotes: initial?.writingStyleNotes ?? "",
      bannedWords: initial?.bannedWords ?? "",
      preferredPostLength: initial?.preferredPostLength ?? "medium",
      defaultPlatform: initial?.defaultPlatform ?? "Both",
    },
  });

  async function onSubmit(values: ProductProfileInput) {
    setSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/product-profile/${initial!.id}` : "/api/product-profile",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save profile.");
        return;
      }
      toast.success(isEdit ? "Profile updated." : "Product profile created.");
      if (embedded) {
        onCreated?.();
        router.refresh();
        return;
      }
      router.push("/dashboard/product");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Product name" htmlFor="productName" error={errors.productName?.message}>
          <Input id="productName" placeholder="API Graveyard" {...register("productName")} />
        </Field>
        <Field label="Website" htmlFor="websiteUrl" hint="Optional" error={errors.websiteUrl?.message}>
          <Input id="websiteUrl" placeholder="https://example.com" {...register("websiteUrl")} />
        </Field>
      </div>

      <Field
        label="Short description"
        htmlFor="shortDescription"
        hint="One or two sentences on what the product does."
        error={errors.shortDescription?.message}
      >
        <Textarea
          id="shortDescription"
          rows={3}
          placeholder="A tool that tracks API dependencies and warns teams before deprecated APIs break production."
          {...register("shortDescription")}
        />
      </Field>

      <Field
        label="Target audience"
        htmlFor="targetAudience"
        error={errors.targetAudience?.message}
      >
        <Input
          id="targetAudience"
          placeholder="SaaS founders, engineering teams, platform teams"
          {...register("targetAudience")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Field label="Category" error={errors.category?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="founderTone"
          render={({ field }) => (
            <Field label="Founder tone" error={errors.founderTone?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOUNDER_TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      <Field
        label="Writing style notes"
        htmlFor="writingStyleNotes"
        hint="Optional. How you like to write — short sentences, no emojis, dry humour, etc."
        error={errors.writingStyleNotes?.message}
      >
        <Textarea id="writingStyleNotes" rows={2} {...register("writingStyleNotes")} />
      </Field>

      <Field
        label="Banned words"
        htmlFor="bannedWords"
        hint="Optional. Comma-separated words the generator should avoid."
        error={errors.bannedWords?.message}
      >
        <Input id="bannedWords" placeholder="revolutionary, game-changer" {...register("bannedWords")} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          control={control}
          name="preferredPostLength"
          render={({ field }) => (
            <Field label="Preferred post length" error={errors.preferredPostLength?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_LENGTHS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="defaultPlatform"
          render={({ field }) => (
            <Field label="Default platform" error={errors.defaultPlatform?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Create profile"}
        </Button>
      </div>
    </form>
  );
}
