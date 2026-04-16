import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/auth/msalConfig";
import { motion } from "framer-motion";
import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm flex flex-col items-center gap-8 px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plug className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">MCP Hub Zone</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect to MCP servers and chat with your tools
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="w-full rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Sign in with your Microsoft account to continue
          </p>
          <Button onClick={handleLogin} className="w-full gap-2" size="lg">
            {/* Microsoft logo SVG */}
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Sign in with Microsoft
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing in you agree to your organisation's policies.
        </p>
      </motion.div>
    </div>
  );
}
