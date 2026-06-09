/**
 * Settings Page
 */

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Name</p>
              <p className="text-sm text-gray-600">Your display name</p>
            </div>
            <Button variant="secondary">Edit</Button>
          </div>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Notifications</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {[
            { label: "Email notifications", description: "Get updates via email" },
            { label: "Daily reminders", description: "Remind me to practice" },
          ].map((setting, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
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
