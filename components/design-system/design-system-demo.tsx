"use client";

import * as React from "react";

import { useTheme } from "@/components/providers/theme-provider";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  IconMoon,
  IconSun,
  Input,
  LinkButton,
  Panel,
  ScrollArea,
  Sidebar,
  Skeleton,
  TextArea,
  Toggle,
} from "@/components/ui";

export function DesignSystemDemo() {
  const { theme, setTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <LinkButton href="/chat" variant="secondary">
            LinkButton
          </LinkButton>
          <IconButton aria-label="Icon">
            <span className="text-sm font-semibold">S</span>
          </IconButton>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Inputs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Input</div>
            <Input placeholder="Search…" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">TextArea</div>
            <TextArea placeholder="Multiline…" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Cards & Panels</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="text-sm font-semibold tracking-tight">Card</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Subtle glass, border and elevation.
            </div>
          </Card>
          <Panel className="p-5" inset>
            <div className="text-sm font-semibold tracking-tight">Panel</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Higher elevation for layouts and sidebars.
            </div>
          </Panel>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Dialog, Sidebar & Motion
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button variant="secondary" onClick={() => setSidebarOpen(true)}>
            Open sidebar (mobile)
          </Button>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
            {theme === "dark" ? (
              <IconMoon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <IconSun className="h-4 w-4 text-muted-foreground" />
            )}
            <Toggle
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
            <span className="text-sm">Theme</span>
          </div>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Dialog"
          description="Framer Motion + glass surface"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Use <code>&lt;Dialog /&gt;</code> for modals and drawers.
            </p>
            <Skeleton className="h-10 w-full" />
          </div>
        </Dialog>

        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold tracking-tight">Sidebar</div>
            <div className="text-sm text-muted-foreground">
              This overlay version is intended for mobile.
            </div>
            <Button className="w-full" onClick={() => setSidebarOpen(false)}>
              Close
            </Button>
          </div>
        </Sidebar>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">ScrollArea</h2>
        <ScrollArea className="h-48 rounded-xl border border-border bg-card/40 p-4">
          <div className="space-y-2 text-sm">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="text-muted-foreground">
                Row {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
