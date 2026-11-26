import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Learn at your own pace</h1>
      <p className="text-muted-foreground">Sign in to continue, or create a student account.</p>
      <div className="flex gap-3">
        <Button asChild><Link href="/login">Log in</Link></Button>
        <Button asChild variant="outline"><Link href="/register">Register</Link></Button>
      </div>
    </main>
  );
}
