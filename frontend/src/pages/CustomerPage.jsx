import { useState, useEffect, useCallback } from 'react';
import { dishAPI, orderAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const TAX_RATE = 0.05; // 5% GST

function DishCard({ dish, onAdd }) {
    const imgUrl = dish.photo ? `/uploads/${dish.photo}` : null;

    return (
        <div className="dish-card">
            {imgUrl ? (
                <img className="dish-card-img" src={imgUrl} alt={dish.name} />
            ) : (
                <div className="dish-card-img-placeholder">🍛</div>
            )}
            <div className="dish-card-body">
                <div className="dish-card-name">{dish.name}</div>
                <div className="dish-card-meta">
                    <span className="dish-card-price">₹{dish.price}</span>
                </div>
                <div className="dish-card-location">📍 {dish.location}</div>
                <div className="dish-card-chef">👩‍🍳 {dish.chefName}</div>
                <div className="dish-card-footer">
                    <button className="btn btn-primary btn-sm" onClick={() => onAdd(dish)}>
                        + Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

function CartPanel({ cart, onQty, onClear, onRemove }) {
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const handleOrder = async () => {
        if (cart.length === 0) return;
        setPlacing(true);
        try {
            const items = cart.map((i) => ({ dishId: i._id, qty: i.qty }));
            await orderAPI.place({ items, deliveryAddress: user?.location || '' });
            setSuccess(true);
            onClear();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="cart-panel">
            <h2>🛒 Your Cart {cart.length > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--saffron-dark)' }}>({cart.length} items)</span>}</h2>

            {success ? (
                <div className="order-success">
                    <div className="success-icon">✅</div>
                    <h3>Order Placed!</h3>
                    <p className="text-sm text-muted" style={{ marginTop: 4 }}>Your order is confirmed. Enjoy! 🎉</p>
                </div>
            ) : cart.length === 0 ? (
                <div className="cart-empty">
                    <div className="cart-empty-icon">🛒</div>
                    <p>Your cart is empty</p>
                    <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Add dishes from the menu</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                {item.photo ? (
                                    <img className="cart-item-img" src={`/uploads/${item.photo}`} alt={item.name} />
                                ) : (
                                    <div className="cart-item-img" style={{ background: 'var(--cream-dark)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🍛</div>
                                )}
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.name}</div>
                                    <div className="cart-item-price">₹{(item.price * item.qty).toFixed(2)}</div>
                                </div>
                                <div className="cart-qty-controls">
                                    <button className="qty-btn" onClick={() => onQty(item.cartId, -1)}>−</button>
                                    <span className="qty-num">{item.qty}</span>
                                    <button className="qty-btn" onClick={() => onQty(item.cartId, +1)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="cart-divider" />
                    <div className="cart-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                    <div className="cart-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                    <div className="cart-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                    <br />
                    <button
                        className="btn btn-primary btn-full"
                        onClick={handleOrder}
                        disabled={placing}
                    >
                        {placing ? '⏳ Placing Order…' : '🍲 Place Order'}
                    </button>
                    <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: 8 }} onClick={onClear}>
                        Clear Cart
                    </button>
                </>
            )}
        </div>
    );
}

export default function CustomerPage() {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [cart, setCart] = useState([]);

    const loadDishes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dishAPI.getAll({ search, location: locationFilter });
            setDishes(res.data);
        } catch {
            setDishes([]);
        } finally {
            setLoading(false);
        }
    }, [search, locationFilter]);

    useEffect(() => { loadDishes(); }, [loadDishes]);

    const addToCart = (dish) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === dish._id);
            if (existing) {
                return prev.map((i) => i._id === dish._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...dish, cartId: `${dish._id}-${Date.now()}`, qty: 1 }];
        });
    };

    const changeQty = (cartId, delta) => {
        setCart((prev) =>
            prev
                .map((i) => i.cartId === cartId ? { ...i, qty: i.qty + delta } : i)
                .filter((i) => i.qty > 0)
        );
    };

    const clearCart = () => setCart([]);

    // Get unique locations from dishes for filter dropdown
    const locations = [...new Set(dishes.map((d) => d.location).filter(Boolean))];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🏠 Today's Home Kitchen</h1>
                <p>Fresh, authentic meals cooked by home chefs near you</p>
            </div>

            <div className="customer-layout">
                <div>
                    {/* Search & Filter */}
                    <div className="filter-bar">
                        <input
                            type="text"
                            placeholder="🔍 Search dishes…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                            <option value="">📍 All Locations</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading-screen" style={{ height: 300 }}>
                            <div className="spinner" />
                            <p>Loading dishes…</p>
                        </div>
                    ) : dishes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🍽️</div>
                            <h3>No dishes found</h3>
                            <p>Try searching with different keywords or clear the filter.</p>
                        </div>
                    ) : (
                        <div className="dishes-grid">
                            {dishes.map((dish) => (
                                <DishCard key={dish._id} dish={dish} onAdd={addToCart} />
                            ))}
                        </div>
                    )}
                </div>

                <CartPanel cart={cart} onQty={changeQty} onClear={clearCart} />
            </div>
        </div>
    );
}
