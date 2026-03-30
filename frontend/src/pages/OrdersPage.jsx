import { useState, useEffect, useCallback } from 'react';
import { orderAPI, dishAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'delivered'];

function StatusTimeline({ status }) {
    const cancelled = status === 'cancelled';
    const activeIdx = STATUS_STEPS.indexOf(status);

    if (cancelled) {
        return (
            <div className="status-timeline cancelled-line">
                <span className="status-timeline-cancelled">❌ Order Cancelled</span>
            </div>
        );
    }

    return (
        <div className="status-timeline">
            {STATUS_STEPS.map((step, i) => {
                const done = i <= activeIdx;
                const active = i === activeIdx;
                return (
                    <div key={step} className={`timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <div className="timeline-dot" />
                        {i < STATUS_STEPS.length - 1 && <div className={`timeline-line ${i < activeIdx ? 'done' : ''}`} />}
                        <div className="timeline-label">{step}</div>
                    </div>
                );
            })}
        </div>
    );
}

function RatingWidget({ dishId, dishName, onRated }) {
    const [stars, setStars] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const submit = async () => {
        if (!stars) return;
        setLoading(true);
        try {
            await dishAPI.rate(dishId, { stars, comment });
            setDone(true);
            onRated && onRated();
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (done) return <div className="rating-done">✅ Thanks for your rating!</div>;

    return (
        <div className="rating-widget">
            <div className="rating-dish-name">Rate: {dishName}</div>
            <div className="star-row">
                {[1, 2, 3, 4, 5].map((s) => (
                    <span
                        key={s}
                        className={`star ${s <= (hover || stars) ? 'lit' : ''}`}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setStars(s)}
                    >★</span>
                ))}
            </div>
            <input
                className="rating-comment"
                type="text"
                placeholder="Add a comment (optional)…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button
                className="btn btn-primary btn-sm"
                onClick={submit}
                disabled={!stars || loading}
            >
                {loading ? 'Submitting…' : 'Submit Rating'}
            </button>
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadOrders = useCallback(async () => {
        try {
            const res = await orderAPI.getMy();
            setOrders(res.data);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 15000); // poll every 15s
        return () => clearInterval(interval);
    }, [loadOrders]);

    const handleCancel = async (id) => {
        const reason = window.prompt('Reason for cancellation (optional):');
        if (reason === null) return; // User cancelled the prompt
        try {
            await orderAPI.cancel(id, reason);
            loadOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customer')}>← Back</button>
                <div>
                    <h1>📦 My Orders</h1>
                    <p>Live order tracking — refreshes every 15 seconds</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-screen" style={{ height: 300 }}>
                    <div className="spinner" />
                    <p>Loading your orders…</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>Place an order to track it here.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/customer')}>
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div className="orders-tracking-list">
                    {orders.map((order) => (
                        <div key={order._id} className="tracking-card">
                            <div className="tracking-card-header">
                                <div>
                                    <div className="order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                        👩‍🍳 {order.chefName}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="order-total" style={{ fontSize: '1.05rem' }}>₹{order.totalAmount.toFixed(2)}</div>
                                    <div className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <StatusTimeline status={order.status} />

                            {/* Items */}
                            <div className="tracking-items">
                                {order.items.map((it, i) => (
                                    <div key={i} className="tracking-item-row" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>🍽️ {it.dishName} × {it.qty}</span>
                                            <span>₹{(it.price * it.qty).toFixed(2)}</span>
                                        </div>
                                        {it.dish && it.dish.ratingCount > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginLeft: 22 }}>
                                                {'★'.repeat(Math.round(it.dish.avgRating))}{'☆'.repeat(5 - Math.round(it.dish.avgRating))} {it.dish.avgRating} ({it.dish.ratingCount})
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {order.deliveryAddress && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                    📍 {order.deliveryAddress}
                                </div>
                            )}

                            {/* Cancellation section */}
                            {order.status === 'cancelled' && order.cancellationReason && (
                                <div style={{ marginTop: 12, padding: 8, background: '#fee2e2', color: '#b91c1c', borderRadius: 4, fontSize: '0.85rem' }}>
                                    <strong>Reason:</strong> {order.cancellationReason}
                                </div>
                            )}
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => handleCancel(order._id)}>
                                    Cancel Order
                                </button>
                            )}

                            {/* Rating widget for delivered orders */}
                            {order.status === 'delivered' && order.items.map((it, i) => (
                                <RatingWidget key={i} dishId={it.dish?._id || it.dish} dishName={it.dishName} onRated={loadOrders} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
