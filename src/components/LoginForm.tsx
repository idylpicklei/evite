import { useState, type FormEvent } from 'react';

interface LoginFormProps {
  initialCode?: string;
}

export default function LoginForm({ initialCode = '' }: LoginFormProps) {
  const [fullName, setFullName] = useState('');
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, inviteCode }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to sign in. Please try again.');
        return;
      }

      window.location.href = '/rsvp';
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">Welcome</h2>
      <p className="form-subtitle">Enter your name and invite code to RSVP.</p>

      <div className="form-group">
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder="As written on your invitation"
        />
      </div>

      <div className="form-group">
        <label htmlFor="inviteCode">Invite code</label>
        <input
          id="inviteCode"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
          autoComplete="off"
          placeholder="Your unique code"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Signing in…' : 'Continue to RSVP'}
      </button>
    </form>
  );
}
