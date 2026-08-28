import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const notConnected = (provider: string) =>
    toast.info(`${provider} sign-in isn't connected yet`, {
      description: "Enable the backend to activate accounts and project sync.",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login / Register</DialogTitle>
          <DialogDescription>
            Sign in to sync your projects, dictionary, and tags across devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email">
          <TabsList className="w-full">
            <TabsTrigger value="email" className="flex-1">
              Email
            </TabsTrigger>
            <TabsTrigger value="google" className="flex-1">
              Google
            </TabsTrigger>
            <TabsTrigger value="discord" className="flex-1">
              Discord
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button className="mt-1 gap-2" onClick={() => notConnected("Email")}>
              <Mail className="size-4" /> Continue with Email
            </Button>
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => notConnected("Google")}
            >
              Continue with Google
            </Button>
          </TabsContent>

          <TabsContent value="discord" className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => notConnected("Discord")}
            >
              Continue with Discord
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
