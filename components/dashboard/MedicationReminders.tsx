"use client";

import { useState, useEffect } from "react";
import { Pill, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_MEDICATION_SCHEDULE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MedicationReminders() {
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState(MOCK_MEDICATION_SCHEDULE);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id
          ? { ...med, taken: !med.taken, status: !med.taken ? "taken" : "due" }
          : med
      )
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold font-heading">Today's Medications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {medications.map((med) => (
              <div
                key={med.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                  med.taken
                    ? "bg-muted/30 border-border"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                <button
                  onClick={() => toggleTaken(med.id)}
                  className={cn(
                    "size-5 rounded border-2 flex items-center justify-center shrink-0 transition-all active:scale-95",
                    med.taken
                      ? "bg-primary border-primary"
                      : "border-border hover:border-primary"
                  )}
                  aria-label={med.taken ? "Mark as not taken" : "Mark as taken"}
                >
                  {med.taken && (
                    <Check className="size-3 text-primary-foreground stroke-[3]" />
                  )}
                </button>

                <div className="size-9 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                  <Pill className="size-4 text-primary stroke-[1.5]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    med.taken ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {med.medication}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {med.dosage} • {med.time}
                  </p>
                </div>

                <Badge
                  variant={
                    med.status === "taken"
                      ? "success"
                      : med.status === "due"
                      ? "warning"
                      : "default"
                  }
                  className="text-[10px] px-2 py-0 shrink-0"
                >
                  {med.status === "taken"
                    ? "Taken"
                    : med.status === "due"
                    ? "Due Now"
                    : "Upcoming"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
