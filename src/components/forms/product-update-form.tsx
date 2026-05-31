"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  productUpdateSchema,
  type ProductUpdateInput,
  type ProductUpdateFormValues,
} from "@/lib/validators/product-update";
import { UPDATE_TYPES, IMPORTANCE_LEVELS } from "@/lib/constants";
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

type UpdateRecord = ProductUpdateFormValues & { id: string };

export function ProductUpdateForm({
  initial,
  onDone,
}: {
  initial?: UpdateRecord | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductUpdateFormValues, unknown, ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      title: initial?.title ?? "",
      updateType: initial?.updateType ?? "Feature shipped",
      rawNotes: initial?.rawNotes ?? "",
      importance: initial?.importance ?? "medium",
      includeLink: initial?.includeLink ?? false,
      linkUrl: initial?.linkUrl ?? "",
    },
  });

  async function onSubmit(values: ProductUpdateInput) {
    setSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/updates/${initial!.id}` : "/api/updates",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save update.");
        return;
      }
      toast.success(isEdit ? "Update saved." : "Update added.");
      onDone?.();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field label="Title" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="Reduced first dashboard load from 6s to 1.8s"
          {...register("title")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="updateType"
          render={({ field }) => (
            <Field label="Update type" error={errors.updateType?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="importance"
          render={({ field }) => (
            <Field label="Importance" error={errors.importance?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      <Field
        label="Raw notes"
        htmlFor="rawNotes"
        hint="Paste it as you'd say it. Real details make better posts."
        error={errors.rawNotes?.message}
      >
        <Textarea
          id="rawNotes"
          rows={5}
          placeholder="Fixed onboarding speed. The first dashboard load used to take ~6s because we fetched everything on mount; now it's a cached summary that renders in ~1.8s."
          {...register("rawNotes")}
        />
      </Field>

      <Controller
        control={control}
        name="includeLink"
        render={({ field }) => (
          <div className="space-y-3 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[var(--accent)]"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              Include a link in posts
            </label>
            {field.value && (
              <Field label="Link URL" htmlFor="linkUrl" error={errors.linkUrl?.message}>
                <Input
                  id="linkUrl"
                  placeholder="https://example.com/changelog"
                  {...register("linkUrl")}
                />
              </Field>
            )}
          </div>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Add update"}
        </Button>
      </div>
    </form>
  );
}
