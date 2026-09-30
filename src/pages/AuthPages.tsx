import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Zap, Car, Shield, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthPagesProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  onNavigate: (tab: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode, onNavigate }) => {
  const { signIn, signUp } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('driver');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        if (!fullName.trim() || !email.trim() || !password) {
          setErrorMessage('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }

        const res = await signUp(email, password, fullName, role);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account.');
        } else {
          // Route according to role
          if (role === 'driver') onNavigate('driver');
          else if (role === 'operator') onNavigate('operator');
          else if (role === 'fleet_manager') onNavigate('fleet');
        }
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          setErrorMessage('Please provide your email and password.');
          setIsLoading(false);
          return;
        }

        const res = await signIn(email, role);
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid credentials.');
        } else {
          if (role === 'driver') onNavigate('driver');
          else if (role === 'operator') onNavigate('operator');
          else if (role === 'fleet_manager') onNavigate('fleet');
        }
      } else if (mode === 'forgot-password') {
        if (!email.trim()) {
          setErrorMessage('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }
        setTimeout(() => {
          setSuccessMessage('Password reset link dispatched. Please check your inbox.');
          setIsLoading(false);
        }, 600);
        return;
      } else if (mode === 'reset-password') {
        if (!password) {
          setErrorMessage('Please provide a new password.');
          setIsLoading(false);
          return;
        }
        setTimeout(() => {
          setSuccessMessage('Password successfully updated. You may now sign in.');
          setIsLoading(false);
        }, 600);
        return;
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
            <Zap className="w-6 h-6 fill-[#2563EB] text-[#2563EB]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">
            {mode === 'signup' && 'Create your ChargeOS Account'}
            {mode === 'login' && 'Sign In to ChargeOS'}
            {mode === 'forgot-password' && 'Reset your Password'}
            {mode === 'reset-password' && 'Enter New Password'}
          </h1>
          <p className="text-xs text-[#334155] mt-1">
            Enterprise EV Charging Network • Maharashtra Region
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Priya Sharma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="priya.sharma@domain.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {(mode === 'signup' || mode === 'login' || mode === 'reset-password') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#0F172A]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-[11px] text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          )}

          {/* Role Selection (Mandatory for Signup and role targeting) */}
          {(mode === 'signup' || mode === 'login') && (
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    role === 'driver'
                      ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Driver</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('operator')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    role === 'operator'
                      ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('fleet_manager')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    role === 'fleet_manager'
                      ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[11px] block">Fleet Mgr</span>
                </button>
              </div>
            </div>
          )}

          <Button variant="primary" size="md" className="w-full mt-2" isLoading={isLoading} type="submit">
            {mode === 'signup' && 'Create Account'}
            {mode === 'login' && 'Sign In'}
            {mode === 'forgot-password' && 'Send Reset Link'}
            {mode === 'reset-password' && 'Update Password'}
          </Button>
        </form>

        {/* Footer switches */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-[#334155]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => onNavigate('signup')} className="font-semibold text-[#2563EB] hover:underline">
                Sign up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="font-semibold text-[#2563EB] hover:underline">
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Return to{' '}
              <button onClick={() => onNavigate('login')} className="font-semibold text-[#2563EB] hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
