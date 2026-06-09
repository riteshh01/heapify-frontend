/**
 * Signup Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Card className="max-w-md">
      <CardBody>
        <form className="space-y-4">
          <Input label="Name" type="text" placeholder="Your name" required />
          <Input label="Email" type="email" placeholder="your@email.com" required />
          <Input label="Password" type="password" placeholder="••••••••" required />
          <Input label="Confirm Password" type="password" placeholder="••••••••" required />
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
