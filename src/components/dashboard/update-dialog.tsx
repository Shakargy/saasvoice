"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductUpdateForm } from "@/components/forms/product-update-form";
import type { ProductUpdateFormValues } from "@/lib/validators/product-update";

type UpdateRecord = ProductUpdateFormValues & { id: string };

export function UpdateDialog({
  initial,
  trigger,
}: {
  initial?: UpdateRecord | null;
  trigger?: "new" | "edit";
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "edit" ? (
          <Button variant="outline" size="sm">
            <Pencil /> Edit
          </Button>
        ) : (
          <Button>
            <Plus /> New update
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit update" : "New product update"}</DialogTitle>
          <DialogDescription>
            Capture what changed. SaaSVoice turns it into founder-style posts.
          </DialogDescription>
        </DialogHeader>
        <ProductUpdateForm initial={initial} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
