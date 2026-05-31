"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-0 left-0 h-full max-w-64 translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0">
        <DialogTitle className="text-base">Menu</DialogTitle>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
