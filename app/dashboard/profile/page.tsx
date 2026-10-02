import { MOCK_USER } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Your personal information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="size-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold font-heading">
              {MOCK_USER.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
                {MOCK_USER.name}
              </h2>
              <p className="text-muted-foreground font-mono text-sm mb-3">
                ABHA ID: {MOCK_USER.abhaId}
              </p>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Full Name
                </p>
                <p className="text-base text-foreground font-medium">{MOCK_USER.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Calendar className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Date of Birth
                </p>
                <p className="text-base text-foreground font-medium">
                  {new Date(MOCK_USER.dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Gender
                </p>
                <p className="text-base text-foreground font-medium">{MOCK_USER.gender}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mail className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Email
                </p>
                <p className="text-base text-foreground font-medium">arjun.sharma@example.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Phone className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Phone
                </p>
                <p className="text-base text-foreground font-medium font-mono">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="size-5 text-muted-foreground stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Location
                </p>
                <p className="text-base text-foreground font-medium">Chennai, Tamil Nadu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
