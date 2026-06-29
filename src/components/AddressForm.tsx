import { useState, type FormEvent } from 'react';

interface AddressFormProps {
  initialData?: {
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string | null;
    postal_code?: string;
    country?: string;
  } | null;
}

export default function AddressForm({ initialData }: AddressFormProps) {
  const [line1, setLine1] = useState(initialData?.line1 ?? '');
  const [line2, setLine2] = useState(initialData?.line2 ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [state, setState] = useState(initialData?.state ?? '');
  const [postalCode, setPostalCode] = useState(initialData?.postal_code ?? '');
  const [country, setCountry] = useState(initialData?.country ?? 'US');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line1,
          line2: line2 || null,
          city,
          state: state || null,
          postalCode,
          country,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to save address. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Unable to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">Physical Invitation</h2>
      <p className="form-subtitle">
        Share your mailing address to receive a physical invitation by post.
      </p>

      <div className="form-group">
        <label htmlFor="line1">Street address</label>
        <input
          id="line1"
          type="text"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          required
          autoComplete="address-line1"
        />
      </div>

      <div className="form-group">
        <label htmlFor="line2">Apartment, suite, etc. (optional)</label>
        <input
          id="line2"
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          autoComplete="address-line2"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            autoComplete="address-level2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State / Province</label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            autoComplete="address-level1"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="postalCode">Postal code</label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            autoComplete="postal-code"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            autoComplete="country-name"
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">Your address has been saved. Thank you!</p>}

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Saving…' : 'Save Mailing Address'}
      </button>
    </form>
  );
}
