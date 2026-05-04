import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="label-caps">{title}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
      </header>

      <Card>
        <CardContent className="pt-8 pb-10 text-center">
          <div className="text-5xl">{emoji}</div>
          <p className="mt-6 text-base text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
