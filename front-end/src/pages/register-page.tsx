import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Mail, Lock, User, Eye, EyeOff, Check, Workflow, Compass, Layers } from 'lucide-react';
import { Button, Input } from '../components/ui';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI || 'http://localhost:8200';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /\d/.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Erreur lors de l'inscription");
        return;
      }
      window.location.href = '/';
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Workflow className="w-4 h-4 text-[#3c50e0]" />
          BPMN Decision Analytics
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Spin up a new decision workspace
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          Invite collaborators, map every gateway, and monitor governance from day zero.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-wider text-slate-400">Model library</p>
          <div className="mt-2 flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">150+ assets</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Reusable pools, lanes, and connectors.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-wider text-slate-400">Scenario kit</p>
          <div className="mt-2 flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-500" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">8 playbooks</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Stress-test SLA and compliance paths.</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-wider text-slate-400">Automation</p>
          <div className="mt-2 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-sky-500" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Live sync</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Push models to your orchestration engine.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="First name"
            icon={<User className="w-5 h-5" />}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            icon={<Lock className="w-5 h-5" />}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {formData.password && (
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Password requirements:</p>
            <div className="grid grid-cols-2 gap-2">
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  <Check className={`w-3.5 h-3.5 ${req.met ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          icon={<Lock className="w-5 h-5" />}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#3c50e0] focus:ring-[#3c50e0]"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            I agree to the{' '}
            <a href="#" className="text-[#3c50e0] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#3c50e0] hover:underline">Privacy Policy</a>
          </span>
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={!agreeTerms || loading}>
          {loading ? 'Inscription...' : 'Launch workspace'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Already building flows?{' '}
        <Link to="/login" className="text-[#3c50e0] hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
