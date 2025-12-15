import { Card, LinkButton, Panel } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-8">
      <Panel className="px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium tracking-[0.24em] text-muted-foreground">
              SATYNX
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Black-first design system for a futuristic AI chat.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Shared UI primitives live under <code>components/ui</code>. Motion is
              handled by Framer Motion and respects <code>prefers-reduced-motion</code>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LinkButton href="/chat">Open chat</LinkButton>
            <LinkButton href="/design-system" variant="secondary">
              Design system
            </LinkButton>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold tracking-tight">Tokens</div>
            <div className="text-sm text-muted-foreground">
              Colors, elevation, spacing and motion are driven by CSS variables in
              <code> app/globals.css</code>.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold tracking-tight">Components</div>
            <div className="text-sm text-muted-foreground">
              Buttons, inputs, panels, dialogs, sidebars and scroll areas compose
              the chat UI.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
