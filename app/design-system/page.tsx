import { DesignSystemDemo } from "@/components/design-system/design-system-demo";
import { Card, LinkButton, Panel } from "@/components/ui";

export default function DesignSystemPage() {
  return (
    <div className="space-y-6">
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium tracking-[0.24em] text-muted-foreground">
              SATYNX
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Design system
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Tokens are defined in <code>app/globals.css</code> and exposed to
              Tailwind via <code>@theme</code>. Components live in
              <code> components/ui</code>.
            </p>
          </div>
          <div className="flex gap-3">
            <LinkButton href="/" variant="secondary">
              Home
            </LinkButton>
            <LinkButton href="/chat">Chat</LinkButton>
          </div>
        </div>
      </Panel>

      <Card className="p-6">
        <DesignSystemDemo />
      </Card>
    </div>
  );
}
