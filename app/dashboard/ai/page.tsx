import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">Get help understanding your medical records</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 relative">
            <MessageSquareHeart className="size-10 text-white stroke-[1.5]" />
            <div className="absolute -top-1 -right-1 size-6 rounded-full bg-warning flex items-center justify-center">
              <Sparkles className="size-4 text-warning-foreground stroke-[2]" />
            </div>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
            AI Assistant Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Soon you'll be able to ask questions about your health records, get explanations of medical terms,
            and receive personalized health insights powered by AI.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button disabled className="gap-2">
              <Sparkles className="size-4 stroke-[1.5]" />
              Try AI Assistant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="size-10 rounded-full bg-primary-tint flex items-center justify-center mb-4">
              <MessageSquareHeart className="size-5 text-primary stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold font-heading text-foreground mb-2">
              Natural Language Queries
            </h3>
            <p className="text-sm text-muted-foreground">
              Ask questions in plain English and get instant answers about your health records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="size-10 rounded-full bg-secondary-tint flex items-center justify-center mb-4">
              <Sparkles className="size-5 text-secondary stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold font-heading text-foreground mb-2">
              Medical Term Explanations
            </h3>
            <p className="text-sm text-muted-foreground">
              Get clear, simple explanations of complex medical terminology and test results
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
