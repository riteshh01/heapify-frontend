/**
 * Email Verification Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function EmailVerifyPage() {
  return (
    <Card className="max-w-md">
      <CardBody>
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-4 text-gray-600">
            We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
          </p>
          <Button className="w-full mt-6">Resend Email</Button>
        </div>
      </CardBody>
    </Card>
  );
}
