import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Inline SVG logo: a wok/karai with steam forming letter G
const GhareswadLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wok body */}
        <ellipse cx="24" cy="34" rx="18" ry="7" fill="#7C2D12" />
        <ellipse cx="24" cy="30" rx="18" ry="7" fill="#F97316" />
        <ellipse cx="24" cy="26" rx="18" ry="7" fill="#FED7AA" />
        <ellipse cx="24" cy="26" rx="14" ry="5" fill="#FFF7ED" />
        {/* Handle */}
        <rect x="38" y="27" width="8" height="3" rx="1.5" fill="#7C2D12" />
        {/* Steam curls forming G */}
        <path d="M16 20 Q14 14 18 10 Q20 8 18 6" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M21 19 Q19 12 23 8 Q25 5 23 3" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* G letter from steam */}
        <text x="26" y="14" fontSize="11" fontWeight="900" fontFamily="Poppins,sans-serif" fill="#7C2D12" letterSpacing="-0.5">G</text>
    </svg>
);

export default function Navbar() {
    const { user, logout, isChef } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="brand">
                <GhareswadLogo size={40} />
                <div>
                    <div className="brand-text-title">Ghareswad</div>
                    <div className="brand-text-sub">Ghar ka khana, aapke paas</div>
                </div>
            </div>

            <div className="nav-right">
                {user && (
                    <>
                        <span className="nav-user">👋 {user.name}</span>
                        <span className={`role-badge ${isChef ? 'chef' : ''}`}>
                            {isChef ? '👩‍🍳 Chef' : '🛒 Customer'}
                        </span>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
