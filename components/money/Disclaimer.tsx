import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Disclaimer() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Keine Beratung nach § 34i GewO.</strong>{" "}
              Daily Flow ist ein persönliches Tracking-Tool, kein zugelassener
              Finanzierungsvermittler. Alle hier dargestellten Berechnungen
              basieren auf vereinfachten Annahmen (Annuitätsformel, mittlere
              Marktzinsen Stand Mitte 2026) und ersetzen keine individuelle
              Beratung.
            </p>
            <p>
              <strong className="text-foreground">Vor Vertragsabschluss:</strong>{" "}
              Vergleiche mindestens 3 Anbieter — z. B. Interhyp, Dr. Klein,
              Hüttig &amp; Rompf — und ziehe einen unabhängigen Honorar-Berater
              hinzu. KfW-Programme (insb. <em>300 Wohneigentum für Familien</em>)
              prüfen lohnt sich, sobald Kind / Elterngeld dazukommt.
            </p>
            <p>
              <strong className="text-foreground">Annahmen:</strong> Notar nach
              GNotKG-Tabelle, Maklerprovision Bestellerprinzip 3,57 % hälftig.
              Banken rechnen Selbstständigkeits-Einkommen typischerweise erst
              nach 2–3 Jahren BWA / EÜR voll an; Elterngeld i. d. R. nicht.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
