import { MOCK_CONSENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, Check, X } from "lucide-react";

export default function ConsentPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      case "EXPIRED":
      case "DENIED":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Consent & Sharing</h1>
        <p className="text-muted-foreground">Control who can access your medical records</p>
      </div>

      {/* Pending Consents */}
      {MOCK_CONSENTS.filter(c => c.status === "PENDING").length > 0 && (
        <section>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Pending Requests
          </h2>
          <div className="grid gap-4">
            {MOCK_CONSENTS.filter(c => c.status === "PENDING").map((consent, index) => (
              <Card
                key={consent.id}
                className="border-primary/20 hover:shadow-md transition-shadow animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Icon */}
                    <div className="size-14 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-7 text-primary stroke-[1.5]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                            {consent.facility}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {consent.clinician}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(consent.status)}>
                          {consent.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Purpose
                          </span>
                          <p className="text-sm text-foreground mt-1">{consent.purpose}</p>
                        </div>

                        <div>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                            Requested Access
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {consent.scope.map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-4 stroke-[1.5]" />
                          <span>Duration: {consent.duration}</span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Requested: {formatDate(consent.requestedAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button className="gap-2">
                          <Check className="size-4 stroke-[2]" />
                          Approve
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <X className="size-4 stroke-[2]" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Consent History */}
      <section>
        <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
          History
        </h2>
        <div className="grid gap-4">
          {MOCK_CONSENTS.filter(c => c.status !== "PENDING").map((consent, index) => (
            <Card key={consent.id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-5 text-muted-foreground stroke-[1.5]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-base font-semibold font-heading text-foreground">
                          {consent.facility}
                        </h3>
                        <p className="text-sm text-muted-foreground">{consent.clinician}</p>
                      </div>
                      <Badge variant={getStatusVariant(consent.status)}>
                        {consent.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {consent.purpose}
                    </p>

                    <div className="text-xs text-muted-foreground">
                      {formatDate(consent.requestedAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
