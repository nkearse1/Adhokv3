import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SignInFormProps {
  user_role?: string;
}

export function SignInForm({ user_role = 'client' }: SignInFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !authData?.user) {
        throw signInError || new Error('Invalid login');
      }

      const userRole = authData.user.user_metadata?.user_role;

      // Successfully signed in
      toast.success("Signed in successfully!");

      // Determine redirect path based on user role
      let redirectPath = '/';
      if (userRole === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (userRole === 'client') {
        redirectPath = '/client/dashboard';
      } else if (userRole === 'talent') {
        redirectPath = '/talent/dashboard';
      }

      // Use replace instead of push to prevent back button from returning to login
      navigate(redirectPath, { replace: true });

    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="max-w-md mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}