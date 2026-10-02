import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Upload } from "lucide-react";

export default function DocumentsPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "success";
      case "PROCESSING":
        return "warning";
      case "NEEDS_REVIEW":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">Manage your medical documents and records</p>
        </div>
        <Button className="gap-2 w-fit">
          <Upload className="size-4 stroke-[1.5]" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_DOCUMENTS.map((doc, index) => (
          <Card
            key={doc.id}
            className="hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Icon */}
                <div className="size-12 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
                  <FileText className="size-6 text-primary stroke-[1.5]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold font-heading text-foreground truncate">
                      {doc.title}
                    </h3>
                    <Badge variant={getStatusVariant(doc.status)} className="w-fit">
                      {doc.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Type:</span>
                      <span>{getTypeLabel(doc.type)}</span>
                    </span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Uploaded:</span>
                      <span>
                        {new Date(doc.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="size-4 stroke-[1.5]" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="size-4 stroke-[1.5]" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state if needed */}
      {MOCK_DOCUMENTS.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="size-8 text-muted-foreground stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
              No documents yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Upload your medical documents to keep everything in one place
            </p>
            <Button className="gap-2">
              <Upload className="size-4 stroke-[1.5]" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
