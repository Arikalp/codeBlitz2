import { MOCK_TIMELINE } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FlaskConical, Stethoscope, Pill } from "lucide-react";

export default function TimelinePage() {
  const getIcon = (type: string) => {
    switch (type) {
      case "LAB_REPORT":
        return FlaskConical;
      case "CONSULTATION":
        return Stethoscope;
      case "PRESCRIPTION":
        return Pill;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Health Timeline</h1>
        <p className="text-muted-foreground">Your complete medical history, chronologically</p>
      </div>

      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-border" aria-hidden="true" />

        <div className="space-y-6">
          {MOCK_TIMELINE.map((record, index) => {
            const Icon = getIcon(record.type);

            return (
              <div key={record.id} className="relative pl-12 animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 size-9 rounded-full bg-primary flex items-center justify-center ring-4 ring-background shadow-sm">
                  <Icon className="size-4 text-white stroke-[1.5]" />
                </div>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(record.type)}
                          </Badge>
                          {record.verified && (
                            <Badge variant="success" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold font-heading text-foreground">
                          {record.title}
                        </h3>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Facility:</span>
                        <span className="text-foreground font-medium">{record.facility}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Clinician:</span>
                        <span className="text-foreground font-medium">{record.clinician}</span>
                      </div>
                    </div>

                    {record.fields && record.fields.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                          Key Details
                        </p>
                        {record.fields.map((field, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{field.key}</span>
                            <span className="text-sm font-mono font-semibold text-foreground">
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* End marker */}
        <div className="relative pl-12 pt-6">
          <div className="absolute left-0 top-6 size-9 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
            <div className="size-2 rounded-full bg-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground italic">End of timeline</p>
        </div>
      </div>
    </div>
  );
}
