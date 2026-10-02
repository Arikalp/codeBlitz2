"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, AlertCircle, FileText, Activity } from "lucide-react";

interface HealthSummaryCardsProps {
  medicationsCount: number;
  allergiesCount: number;
  conditionsCount: number;
  recordsCount: number;
}

export function HealthSummaryCards({
  medicationsCount,
  allergiesCount,
  conditionsCount,
  recordsCount,
}: HealthSummaryCardsProps) {
  const cards = [
    {
      title: "Medications",
      value: medicationsCount,
      label: "active prescriptions",
      icon: Pill,
      iconColor: "text-primary",
      bgColor: "bg-primary-tint/40"
    },
    {
      title: "Allergies",
      value: allergiesCount,
      label: "recorded allergens",
      icon: AlertCircle,
      iconColor: "text-warning",
      bgColor: "bg-warm-tint/50"
    },
    {
      title: "Conditions",
      value: conditionsCount,
      label: "active diagnoses",
      icon: Activity,
      iconColor: "text-info",
      bgColor: "bg-secondary-tint/50"
    },
    {
      title: "Health Records",
      value: recordsCount,
      label: "total documents",
      icon: FileText,
      iconColor: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card, i) => (
        <Card key={i} className="group transition-all duration-200 ease-out cursor-default relative overflow-hidden bg-card border-border/60 shadow-sm hover:shadow-md hover:border-border">
          {/* Subtle accent bar on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20 transition-opacity group-hover:opacity-100" style={{ color: `var(--${card.iconColor.split('-')[1]})` }} aria-hidden="true" />

          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`size-8 rounded-full ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`size-4 ${card.iconColor} stroke-[1.5]`} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-3xl font-bold tracking-tight font-heading text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {card.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
