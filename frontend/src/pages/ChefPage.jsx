import { useState, useEffect, useCallback } from 'react';
import { dishAPI, orderAPI } from '../api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, type }) {
    return (
        <div className={`stat-card ${type || ''}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function UploadForm({ onSuccess }) {
    const [form, setForm] = useState({ name: '', price: '', location: '', description: '', category: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false);

    const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setStatus({ type: 'error', msg: 'Please pick a dish photo.' });
        setLoading(true);
        setStatus(null);
        try {
            const fd = new FormData();
            fd.append('photo', file);
            fd.append('name', form.name);
            fd.append('price', form.price);
            fd.append('location', form.location);
            fd.append('description', form.description);
            fd.append('category', form.category || 'Home Cooked');
            await dishAPI.upload(fd);
            setStatus({ type: 'success', msg: '🎉 Dish listed successfully!' });
            setForm({ name: '', price: '', location: '', description: '', category: '' });
            setFile(null);
            setPreview(null);
            onSuccess();
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-card">
            <h2>📸 Add a New Dish</h2>
            <form className="upload-form" onSubmit={handleSubmit}>
                {/* Photo */}
                <div className="upload-photo-area">
                    {preview ? (
                        <img src={preview} alt="Preview" className="upload-photo-preview" />
                    ) : (
                        <>
                            <div className="upload-photo-icon">🖼️</div>
                            <div className="upload-photo-text">Click to upload dish photo</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                JPG, PNG, WEBP · Max 5 MB
                            </div>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFile} required={!file} />
                </div>

                <div className="form-group">
                    <label>Dish Name *</label>
                    <input type="text" placeholder="e.g. Dal Makhani, Aloo Paratha" value={form.name} onChange={update('name')} required />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label>Price (₹) *</label>
                        <input type="number" placeholder="120" min="1" value={form.price} onChange={update('price')} required />
                    </div>
                    <div className="form-group">
                        <label>Location *</label>
                        <input type="text" placeholder="Delhi, Noida…" value={form.location} onChange={update('location')} required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={update('category')}>
                        <option value="">Home Cooked</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Sweets">Sweets &amp; Desserts</option>
                        <option value="Beverages">Beverages</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input type="text" placeholder="A short description…" value={form.description} onChange={update('description')} />
                </div>

                {status && (
                    <div className={`upload-status ${status.type}`}>{status.msg}</div>
                )}

                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    {loading ? '⏳ Uploading…' : '🍲 List Dish'}
                </button>
            </form>
        </div>
    );
}

function ChefDishCard({ dish, onToggle, onDelete }) {
    const imgUrl = dish.photo ? `/uploads/${dish.photo}` : null;
    return (
        <div className="chef-dish-card">
            {imgUrl ? (
                <img className="chef-dish-img" src={imgUrl} alt={dish.name} />
            ) : (
                <div className="chef-dish-img-placeholder">🍛</div>
            )}
            <div className="chef-dish-info">
                <div className="chef-dish-name">{dish.name}</div>
                <div className="chef-dish-price">₹{dish.price}</div>
                <div className="chef-dish-loc">📍 {dish.location}</div>
                <span className={`avail-badge ${dish.isAvailable ? 'on' : 'off'}`}>
                    {dish.isAvailable ? '● Available' : '● Unavailable'}
                </span>
            </div>
            <div className="chef-dish-actions">
                <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => onToggle(dish._id)}>
                    {dish.isAvailable ? 'Pause' : 'Resume'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(dish._id)}>
                    Delete
                </button>
            </div>
        </div>
    );
}

function OrderCard({ order, onStatusChange }) {
    const statuses = ['pending', 'accepted', 'preparing', 'delivered'];
    return (
        <div className="order-card">
            <div className="order-card-header">
                <div>
                    <div className="order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginTop: 2 }}>👤 {order.customerName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                    <div className="order-date" style={{ marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
            <div className="order-items-list">
                {order.items.map((it, i) => (
                    <span key={i}>• {it.dishName} × {it.qty} — ₹{(it.price * it.qty).toFixed(2)}</span>
                ))}
            </div>
            {order.deliveryAddress && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    📍 {order.deliveryAddress}
                </div>
            )}
            <div className="order-card-footer">
                <div className="order-total">₹{order.totalAmount.toFixed(2)}</div>
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                        {statuses.indexOf(order.status) < statuses.length - 1 && (
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => onStatusChange(order._id, statuses[statuses.indexOf(order.status) + 1])}
                            >
                                Mark {statuses[statuses.indexOf(order.status) + 1]}
                            </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(order._id, 'cancelled')}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChefPage() {
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders'
    const [dishes, setDishes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, totalEarnings: 0, pendingOrders: 0, deliveredOrders: 0 });
    const [loadingDishes, setLoadingDishes] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const loadDishes = useCallback(async () => {
        setLoadingDishes(true);
        try {
            const res = await dishAPI.getMy();
            setDishes(res.data);
        } catch { setDishes([]); }
        finally { setLoadingDishes(false); }
    }, []);

    const loadOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const [ordRes, statRes] = await Promise.all([orderAPI.getChef(), orderAPI.getStats()]);
            setOrders(ordRes.data);
            setStats(statRes.data);
        } catch { setOrders([]); }
        finally { setLoadingOrders(false); }
    }, []);

    useEffect(() => { loadDishes(); loadOrders(); }, [loadDishes, loadOrders]);

    const handleToggle = async (id) => {
        try { await dishAPI.toggle(id); loadDishes(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this dish?')) return;
        try { await dishAPI.delete(id); loadDishes(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    const handleStatusChange = async (orderId, status) => {
        try { await orderAPI.updateStatus(orderId, status); loadOrders(); }
        catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👩‍🍳 Chef Dashboard</h1>
                <p>Manage your dishes, track orders, and grow your earnings</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} />
                <StatCard icon="⏳" label="Pending" value={stats.pendingOrders} />
                <StatCard icon="✅" label="Delivered" value={stats.deliveredOrders} />
                <StatCard icon="💰" label="Total Earnings" value={`₹${(stats.totalEarnings || 0).toFixed(0)}`} type="earnings" />
            </div>

            {/* Tabs */}
            <div className="section-tabs">
                <button className={`section-tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
                    🍽️ My Menu
                </button>
                <button className={`section-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    📋 Orders {stats.pendingOrders > 0 && <span style={{ background: 'var(--saffron)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem', marginLeft: 6 }}>{stats.pendingOrders}</span>}
                </button>
            </div>

            {/* Menu Tab */}
            {activeTab === 'menu' && (
                <div className="chef-layout">
                    <UploadForm onSuccess={loadDishes} />
                    <div className="chef-dishes-section">
                        <h2>📋 My Listed Dishes ({dishes.length})</h2>
                        {loadingDishes ? (
                            <div className="loading-screen" style={{ height: 200 }}><div className="spinner" /></div>
                        ) : dishes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🍽️</div>
                                <h3>No dishes yet</h3>
                                <p>Upload your first dish to start getting orders!</p>
                            </div>
                        ) : (
                            dishes.map((d) => (
                                <ChefDishCard key={d._id} dish={d} onToggle={handleToggle} onDelete={handleDelete} />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    {loadingOrders ? (
                        <div className="loading-screen" style={{ height: 200 }}><div className="spinner" /></div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No orders yet</h3>
                            <p>When customers place orders, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((o) => (
                                <OrderCard key={o._id} order={o} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
