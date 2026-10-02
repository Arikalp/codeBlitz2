"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_APPOINTMENTS, MOCK_REMINDERS } from "@/lib/mock-data";

export function UpcomingSection() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const thisWeek = MOCK_APPOINTMENTS.filter(apt => {
    const date = new Date(apt.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= weekFromNow;
  });

  const thisMonth = MOCK_APPOINTMENTS;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold font-heading">Upcoming</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : thisWeek.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No appointments this week"
                description="You're all caught up for now"
              />
            ) : (
              thisWeek.map((apt) => (
                <div
                  key={apt.id}
                  className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="size-10 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                    <Stethoscope className="size-5 text-primary stroke-[1.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {apt.type}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.doctor} • {apt.time}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {apt.facility}
                    </p>
                  </div>
                </div>
              ))
            )}

            {!loading && MOCK_REMINDERS.length > 0 && (
              <div className="pt-2 border-t border-border mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Reminders
                </p>
                {MOCK_REMINDERS.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Clock className="size-4 text-muted-foreground stroke-[1.5] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(reminder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="month" className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              thisMonth.map((apt) => (
                <div
                  key={apt.id}
                  className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="size-10 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                    <Stethoscope className="size-5 text-primary stroke-[1.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {apt.type}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.doctor} • {apt.time}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {apt.facility}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
