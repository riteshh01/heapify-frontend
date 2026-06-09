/**
 * Login Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="max-w-md">
      <CardBody>
        <form className="space-y-4">
          <Input label="Email" type="email" placeholder="your@email.com" required />
          <Input label="Password" type="password" placeholder="••••••••" required />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
