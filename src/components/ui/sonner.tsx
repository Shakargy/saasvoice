"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App is dark-themed by default (see root layout), so we pin the toaster theme
 * to "dark" rather than pulling in next-themes.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
