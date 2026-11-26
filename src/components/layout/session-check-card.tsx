import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionContext } from "@/lib/session";

export function SessionCheckCard({ ctx, title }: { ctx: SessionContext; title: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed-in session (Phase 1 check)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {ctx.name}</p>
          <p><span className="text-muted-foreground">Role:</span> {ctx.role}</p>
          <p><span className="text-muted-foreground">Organization ID:</span> {ctx.organizationId}</p>
        </CardContent>
      </Card>
    </div>
  );
}
