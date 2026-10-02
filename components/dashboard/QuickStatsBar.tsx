"use client";

import { Calendar, Pill, FileText, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  icon: typeof Calendar;
  status?: "success" | "warning" | "info";
}

export function QuickStatsBar() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats: QuickStat[] = [
    {
      id: "1",
      label: "Next Appointment",
      value: "Oct 5",
      icon: Calendar,
      status: "info"
    },
    {
      id: "2",
      label: "Medications Due Today",
      value: "2",
      icon: Pill,
      status: "warning"
    },
    {
      id: "3",
      label: "Pending Lab Results",
      value: "0",
      icon: FileText,
      status: "success"
    },
    {
      id: "4",
      label: "Data Sources",
      value: "3",
      icon: Building2,
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.id}
          className="p-4 hover:shadow-md transition-shadow duration-200 cursor-default"
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {stat.label}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold font-heading text-foreground">
                  {stat.value}
                </p>
                {stat.status && (
                  <Badge
                    variant={stat.status === "success" ? "success" : stat.status === "warning" ? "warning" : "default"}
                    className="text-[10px] px-1.5 py-0 h-4 leading-none"
                  >
                    {stat.status === "success" ? "All clear" : stat.status === "warning" ? "Action needed" : "Scheduled"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="size-9 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
              <stat.icon className="size-4 text-primary stroke-[1.5]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
