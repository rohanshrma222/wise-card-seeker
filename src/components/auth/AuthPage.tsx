import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { first_name: firstName, last_name: lastName },
          },
        });
        if (error) throw error;
        setSuccess('Please check your email to confirm your account!');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blurred Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-purple-700/20 to-transparent rounded-full blur-3xl"></div>

      <Card className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-800/80 to-gray-900/70 border border-gray-600/40 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="w-16 h-10 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-lg border border-gray-500/30 mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <p className="text-gray-400">
          {isLogin ? 'Sign in to your account' : 'Start your credit card journey'}
        </p>
      </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="mb-2 border-red-300 bg-red-950/30 text-red-400 text-sm">
              {error}
            </Alert>
          )}

          {success && (
            <Alert className="mb-2 border-green-300 bg-green-950/30 text-green-400 text-sm">
              {success}
            </Alert>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-gray-800 text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-800 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white border border-gray-600/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-indigo-400 hover:underline transition-all"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
