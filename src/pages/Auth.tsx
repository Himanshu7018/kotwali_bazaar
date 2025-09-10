import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Handle customer signup
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          alert(error.message);
        } else if (data.user) {
          // Create customer role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([
              { user_id: data.user.id, role: 'customer' }
            ]);
          
          if (roleError) {
            console.error('Error creating customer role:', roleError);
          }
          
          alert('Registration successful! Please check your email to verify your account.');
        }
      } catch (error: any) {
        alert('Registration failed: ' + error.message);
      }
    } else {
      // Handle sign in
      const { error } = await signIn(email, password);
      
      if (!error) {
        navigate('/');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Kotwali Bazaar</h1>
          <p className="text-muted-foreground">{isSignUp ? 'Create Customer Account' : 'Admin & Vendor Access'}</p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Create a new customer account to start shopping' 
                : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need a customer account? Sign up'}
              </Button>
            </div>

            {!isSignUp && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Note:</strong> Only registered vendors and administrators can access this system. 
                  If you're a new vendor, please contact the administrator to create your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}