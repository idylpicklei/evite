import { useState, type FormEvent } from 'react';

interface RsvpFormProps {
  fullName: string;
  initialData?: {
    attending?: string | null;
    guest_count?: number;
    dietary_notes?: string | null;
    message?: string | null;
    email?: string | null;
  };
}

export default function RsvpForm({ fullName, initialData }: RsvpFormProps) {
  const [attending, setAttending] = useState(initialData?.attending ?? '');
  const [guestCount, setGuestCount] = useState(initialData?.guest_count ?? 1);
  const [dietaryNotes, setDietaryNotes] = useState(initialData?.dietary_notes ?? '');
  const [message, setMessage] = useState(initialData?.message ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attending,
          guestCount,
          dietaryNotes: dietaryNotes || null,
          message: message || null,
          email: email || null,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to save RSVP. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Unable to save RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">RSVP</h2>
      <p className="form-subtitle">Hello, {fullName}! Please let us know if you can attend.</p>

      <div className="form-group">
        <label htmlFor="attending">Will you attend?</label>
        <select
          id="attending"
          value={attending}
          onChange={(e) => setAttending(e.target.value)}
          required
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="yes">Joyfully accepts</option>
          <option value="no">Regretfully declines</option>
          <option value="maybe">Not sure yet</option>
        </select>
      </div>

      {attending === 'yes' && (
        <div className="form-group">
          <label htmlFor="guestCount">Number of guests (including yourself)</label>
          <input
            id="guestCount"
            type="number"
            min={1}
            max={10}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email (optional)</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="For updates about the wedding"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dietaryNotes">Dietary restrictions (optional)</label>
        <textarea
          id="dietaryNotes"
          value={dietaryNotes}
          onChange={(e) => setDietaryNotes(e.target.value)}
          rows={2}
          placeholder="Allergies, vegetarian, etc."
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message to the couple (optional)</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Share your well wishes"
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">Your RSVP has been saved. Thank you!</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Saving…' : 'Submit RSVP'}
      </button>
    </form>
  );
}
