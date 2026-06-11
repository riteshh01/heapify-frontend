/**
 * Settings Page — 2010s design system
 */

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc]">Settings</h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mt-2 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[#334155] dark:text-[#f1f5f9]">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#334155] dark:text-[#f1f5f9]">Name</p>
              <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">Your display name</p>
            </div>
            <Button variant="secondary">Edit</Button>
          </div>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[#334155] dark:text-[#f1f5f9]">Notifications</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {[
            { label: "Email notifications", description: "Get updates via email" },
            { label: "Daily reminders", description: "Remind me to practice" },
          ].map((setting, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#334155] dark:text-[#f1f5f9]">{setting.label}</p>
                <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">{setting.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-[#cbd5e1] dark:border-[#334155] accent-[#3b5998]"
              />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-300 dark:border-red-500/30">
        <CardHeader>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Button variant="danger" className="w-full">
            Delete Account
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
