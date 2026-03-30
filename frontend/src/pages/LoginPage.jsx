import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Inline SVG logo for the hero panel
const HeroLogo = () => (
    <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="34" rx="18" ry="7" fill="rgba(255,255,255,0.3)" />
        <ellipse cx="24" cy="30" rx="18" ry="7" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="24" cy="26" rx="18" ry="7" fill="rgba(255,255,255,0.7)" />
        <ellipse cx="24" cy="26" rx="14" ry="5" fill="rgba(255,255,255,0.2)" />
        <rect x="38" y="27" width="8" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
        <path d="M16 20 Q14 14 18 10 Q20 8 18 6" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M21 19 Q19 12 23 8 Q25 5 23 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="26" y="14" fontSize="12" fontWeight="900" fontFamily="Poppins,sans-serif" fill="white">G</text>
    </svg>
);

export default function LoginPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [role, setRole] = useState('customer');
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', location: '',
    });

    const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'register') {
                await register({ ...form, role });
            } else {
                await login(form.email, form.password, role);
            }
            // navigate based on role stored in user
            const savedRole = localStorage.getItem('ghareswad_token')
                ? JSON.parse(atob(localStorage.getItem('ghareswad_token').split('.')[1]))
                : null;
            navigate(role === 'chef' ? '/chef' : '/customer');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Hero Panel */}
            <div className="login-hero">
                <HeroLogo />
                <h1>GhorerSwad</h1>
                <p>Authentic home-cooked meals from local moms to your doorstep.</p>
                <div className="hero-features">
                    <div className="hero-feature">
                        <span>🍲</span>
                        <span>Fresh, daily home-cooked meals</span>
                    </div>
                    <div className="hero-feature">
                        <span>👩‍🍳</span>
                        <span>Support local home chefs</span>
                    </div>
                    <div className="hero-feature">
                        <span>📍</span>
                        <span>Hyperlocal delivery</span>
                    </div>
                    <div className="hero-feature">
                        <span>💰</span>
                        <span>Affordable, honest pricing</span>
                    </div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="login-form-panel">
                <h2>Welcome to Ghareswad 🍛</h2>
                <p className="subtitle">
                    {tab === 'login' ? 'Sign in to continue' : 'Create your account'}
                </p>

                {/* Role Selection */}
                <div className="role-tabs">
                    <button
                        className={`role-tab ${role === 'customer' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setRole('customer')}
                    >
                        <span className="tab-icon">🛒</span>
                        <span>Customer</span>
                    </button>
                    <button
                        className={`role-tab ${role === 'chef' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setRole('chef')}
                    >
                        <span className="tab-icon">👩‍🍳</span>
                        <span>Home Chef</span>
                    </button>
                </div>

                {/* Login / Register Tabs */}
                <div className="auth-tabs">
                    <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
                        Sign In
                    </button>
                    <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
                        Register
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {tab === 'register' && (
                        <>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="Sunita Sharma"
                                    value={form.name}
                                    onChange={update('name')}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="9876543210"
                                        value={form.phone}
                                        onChange={update('phone')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location *</label>
                                    <input
                                        type="text"
                                        placeholder="Delhi, Noida…"
                                        value={form.location}
                                        onChange={update('location')}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={update('email')}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={update('password')}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="form-error">⚠ {error}</p>}

                    <button
                        className="btn btn-primary btn-full btn-lg"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? '⏳ Please wait…'
                            : tab === 'login'
                                ? `Sign in as ${role === 'chef' ? 'Home Chef 👩‍🍳' : 'Customer 🛒'}`
                                : `Create ${role === 'chef' ? 'Chef' : 'Customer'} Account`}
                    </button>
                </form>
            </div>
        </div>
    );
}
