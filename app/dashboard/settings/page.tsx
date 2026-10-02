import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Eye, Database, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-10 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
              <Bell className="size-5 text-primary stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                Notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage how you receive updates
              </p>
            </div>
          </div>
          <div className="space-y-3 pl-14">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">Email notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">Consent request alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="size-4 rounded border-border" />
              <span className="text-sm text-foreground">Medication reminders</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-10 rounded-lg bg-secondary-tint flex items-center justify-center shrink-0">
              <Shield className="size-5 text-secondary stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                Privacy & Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Control your data and security settings
              </p>
            </div>
          </div>
          <div className="space-y-3 pl-14">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Eye className="size-4 stroke-[1.5]" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Shield className="size-4 stroke-[1.5]" />
              Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Database className="size-5 text-muted-foreground stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                Data Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Export or delete your health data
              </p>
            </div>
          </div>
          <div className="space-y-3 pl-14">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Download className="size-4 stroke-[1.5]" />
              Download My Data
            </Button>
            <Button variant="destructive" className="w-full justify-start gap-3">
              <Trash2 className="size-4 stroke-[1.5]" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            HealthSetu Demo Version • Built for Patient Care
          </p>
          <p className="text-xs text-muted-foreground">
            This is a prototype using synthetic data only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
