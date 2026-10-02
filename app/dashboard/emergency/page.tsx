import { MOCK_USER, MOCK_ALLERGIES, MOCK_MEDICATIONS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Share2, Download, AlertTriangle, Pill } from "lucide-react";

export default function EmergencyPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Emergency Card</h1>
        <p className="text-muted-foreground">
          Quick access to critical medical information for emergency responders
        </p>
      </div>

      {/* QR Code Card */}
      <Card className="border-primary/30">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className="size-48 bg-white rounded-xl shadow-lg flex items-center justify-center mb-6 border-2 border-border">
            <QrCode className="size-32 text-foreground stroke-[1]" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            Emergency QR Code
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Scan this code to instantly access critical medical information without login
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="gap-2">
              <Download className="size-4 stroke-[1.5]" />
              Download QR
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="size-4 stroke-[1.5]" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Critical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Full Name</span>
                <p className="text-base font-semibold text-foreground">{MOCK_USER.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">ABHA ID</span>
                <p className="text-sm font-mono text-foreground">{MOCK_USER.abhaId}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Date of Birth</span>
                <p className="text-sm text-foreground">
                  {new Date(MOCK_USER.dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Gender</span>
                <p className="text-sm text-foreground">{MOCK_USER.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Type */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">
              Blood Type
            </h3>
            <div className="flex items-center justify-center py-8">
              <span className="text-6xl font-bold font-heading text-destructive">
                {MOCK_USER.bloodGroup}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allergies */}
      <Card className="border-warning/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-warning stroke-[1.5]" />
            <h3 className="text-base font-semibold font-heading text-foreground">
              Critical Allergies
            </h3>
          </div>

          {MOCK_ALLERGIES.length > 0 ? (
            <div className="space-y-3">
              {MOCK_ALLERGIES.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <div>
                    <p className="font-medium text-foreground">{allergy.allergen}</p>
                    <p className="text-sm text-muted-foreground">
                      {allergy.type} • Discovered {new Date(allergy.discovered).getFullYear()}
                    </p>
                  </div>
                  <Badge
                    variant={allergy.severity === "High" ? "destructive" : "warning"}
                    className="shrink-0"
                  >
                    {allergy.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No known allergies recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="size-5 text-primary stroke-[1.5]" />
            <h3 className="text-base font-semibold font-heading text-foreground">
              Current Medications
            </h3>
          </div>

          {MOCK_MEDICATIONS.filter(m => m.status === "Active").length > 0 ? (
            <div className="space-y-3">
              {MOCK_MEDICATIONS.filter(m => m.status === "Active").map((med) => (
                <div
                  key={med.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="size-9 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                    <Pill className="size-4 text-primary stroke-[1.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active medications</p>
          )}
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            This emergency card contains critical medical information. Keep this QR code accessible
            on your phone or printed. Emergency responders can scan it to view your medical details
            without requiring login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
