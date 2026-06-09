/**
 * Forgot Password Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <Card className="max-w-md">
      <CardBody>
        <form className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
          <Input label="Email" type="email" placeholder="your@email.com" required />
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
        <p className="text-center mt-4 text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
