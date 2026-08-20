import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getOrder, getOrderItems, getProfiles, updateOrderStatus } from '../supabase/queries';
import type { OrderRow, OrderItemRow, ProfileRow } from '../supabase/types';

const GOLD = '#B4A180';
const DARK = '#1a1208';
const BG = '#f7f5f2';

type OrderStatus = 'pending' | 'shipped' | 'delivered';

function Badge({ variant, children }: { variant: 'warn' | 'success' | 'info' | 'danger'; children: React.ReactNode }) {
  const m: Record<string, React.CSSProperties> = {
    warn: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    success: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    info: { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
    danger: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
  };
  return <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={m[variant]}>{children}</span>;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { v: 'warn' | 'info' | 'success'; l: string }> = {
    pending: { v: 'warn', l: 'En attente' },
    shipped: { v: 'info', l: 'Expédié' },
    delivered: { v: 'success', l: 'Livré' },
  };
  return <Badge variant={map[status].v}>{map[status].l}</Badge>;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useApp();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const orderId = Number(id);
    getOrder(orderId).then(async (o) => {
      if (cancelled) return;
      if (!o) { setLoading(false); return; }
      setOrder(o);
      const [orderItems, profiles] = await Promise.all([
        getOrderItems(orderId),
        getProfiles(),
      ]);
      if (cancelled) return;
      setItems(orderItems);
      setProfile(profiles.find(p => p.id === o.user_id) || null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    await updateOrderStatus(order.id, status);
    setOrder({ ...order, status });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <svg className="w-8 h-8 animate-spin" style={{ color: GOLD }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: BG }}>
        <h1 className="text-xl font-semibold" style={{ color: '#999' }}>Order not found</h1>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 text-xs rounded-lg" style={{ background: DARK, color: GOLD, border: 'none' }}>
          Back to Admin
        </button>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const total = Number(order.total);
  const shipping = total - subtotal - (order.payment_method === 'cod' ? Math.round(subtotal * 0.05) : 0);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <header className="flex items-center justify-between px-6 py-4" style={{ background: DARK }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-xs hover:underline" style={{ color: GOLD }}>← Back to Admin</button>
          <h1 className="text-lg font-semibold text-white">Order #{order.id}</h1>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Customer Info */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: DARK }}>Customer Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs" style={{ color: '#999' }}>Name</span>
              <p className="font-medium mt-0.5" style={{ color: '#555' }}>{profile?.name || order.customer_name || (order.user_id ? order.user_id.slice(0, 8) : 'Guest')}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#999' }}>Email</span>
              <p className="font-medium mt-0.5" style={{ color: '#555' }}>{profile?.email || order.customer_email || '—'}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#999' }}>Phone</span>
              <p className="font-medium mt-0.5" style={{ color: '#555' }}>{order.phone}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#999' }}>Address</span>
              <p className="font-medium mt-0.5" style={{ color: '#555' }}>{order.address}, {order.city}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: DARK }}>Products Ordered ({items.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
                <th className="pb-3 pr-3 font-medium text-left">Product</th>
                <th className="pb-3 pr-3 font-medium text-left">Size</th>
                <th className="pb-3 pr-3 font-medium text-left">Color</th>
                <th className="pb-3 pr-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i} className="border-b border-stone-50 last:border-0">
                  <td className="py-3 pr-3 font-medium" style={{ color: '#555' }}>{item.product_name}</td>
                  <td className="py-3 pr-3" style={{ color: '#777' }}>
                    <div>{item.size || '—'}</div>
                    {item.custom_measurements && (() => {
                      try {
                        const m = JSON.parse(item.custom_measurements);
                        return (
                          <div className="text-[10px] text-stone-500 mt-1 p-2 bg-stone-50 rounded border border-stone-100/50 space-y-0.5" style={{ minWidth: '160px' }}>
                            <span className="font-semibold block text-[10px]">Mesures (cm):</span>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                              <span>Épaules: {m.shoulders || '—'}</span>
                              <span>Poitrine: {m.bust || '—'}</span>
                              <span>Taille: {m.waist || '—'}</span>
                              <span>Hanches: {m.hips || '—'}</span>
                              <span className="col-span-2">Longueur: {m.length || '—'}</span>
                            </div>
                          </div>
                        );
                      } catch {
                        return <div className="text-[10px] text-stone-500 mt-1">{item.custom_measurements}</div>;
                      }
                    })()}
                  </td>
                  <td className="py-3 pr-3" style={{ color: '#777' }}>{item.color || '—'}</td>
                  <td className="py-3 pr-3 text-right" style={{ color: '#777' }}>{item.quantity}</td>
                  <td className="py-3 text-right font-medium" style={{ color: '#555' }}>{formatPrice(Number(item.price))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: DARK }}>Order Summary</h2>
          <div className="space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between" style={{ color: '#777' }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#777' }}>
              <span>Shipping</span>
              <span>{shipping <= 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            {order.payment_method === 'cod' && (
              <div className="flex justify-between" style={{ color: '#777' }}>
                <span>COD Fee (5%)</span>
                <span>{formatPrice(Math.round(subtotal * 0.05))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-stone-100" style={{ color: DARK }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment & Status */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs" style={{ color: '#999' }}>Payment Method</span>
                <p className="font-medium text-sm mt-0.5" style={{ color: '#555' }}>
                  {order.payment_method === 'whatsapp' ? (
                    <Badge variant="success">WhatsApp</Badge>
                  ) : order.payment_method === 'cod' ? (
                    <Badge variant="warn">Cash on Delivery</Badge>
                  ) : (
                    <Badge variant="info">Card (Stripe)</Badge>
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: '#999' }}>Order Date</span>
                <p className="font-medium text-sm mt-0.5" style={{ color: '#555' }}>
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {order.note && (
                <div>
                  <span className="text-xs" style={{ color: '#999' }}>Note</span>
                  <p className="font-medium text-sm mt-0.5" style={{ color: '#555' }}>{order.note}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {order.status === 'pending' && (
                <button onClick={() => changeStatus('shipped')} className="px-4 py-2 text-xs rounded-lg transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}>
                  Mark as Shipped
                </button>
              )}
              {order.status === 'shipped' && (
                <button onClick={() => changeStatus('delivered')} className="px-4 py-2 text-xs rounded-lg transition-colors hover:opacity-90" style={{ background: '#166534', color: '#fff', border: 'none' }}>
                  Mark as Delivered
                </button>
              )}
              {order.status === 'pending' && (
                <button onClick={() => changeStatus('delivered')} className="px-4 py-2 text-xs rounded-lg transition-colors hover:opacity-90" style={{ background: '#166534', color: '#fff', border: 'none' }}>
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
