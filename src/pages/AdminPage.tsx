import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus,
  getMessages, updateMessage, deleteMessage,
  getProfiles, updateProfile,
  getNewsletterSubscribers, deleteNewsletterSubscriber,
} from '../supabase/queries';
import type { ProductRow, OrderRow, MessageRow, ProfileRow, NewsletterSubscriberRow } from '../supabase/types';
import { supabase } from '../supabase/client';
import SEO from '../components/SEO';
import { slugify } from '../utils/slug';

type Section = 'overview' | 'stock' | 'orders' | 'messages' | 'users' | 'newsletter';
type OrderStatus = 'pending' | 'shipped' | 'delivered';

const GOLD = '#B4A180';
const DARK = '#1a1208';
const BG = '#f7f5f2';

const I = ({ d, size = 18, className, color }: { d: string; size?: number; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>
);

const icons = {
  dashboard: 'M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z',
  box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  bag: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm3 4h-2',
  plus: 'M12 5v14m-7-7h14',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  trash: 'M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  x: 'M18 6L6 18M6 6l12 12',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  reply: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z',
  revenue: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  arrowRight: 'M5 12h14m-7-7l7 7-7 7',
};

const STAT_COLORS: Record<string, { bg: string; color: string }> = {
  products: { bg: '#faeeda', color: '#854f0b' },
  pending: { bg: '#e6f1fb', color: '#185fa5' },
  messages: { bg: '#eeedfe', color: '#3c3489' },
  users: { bg: '#eaf3de', color: '#3b6d11' },
  revenue: { bg: '#faeeda', color: '#854f0b' },
};

function buildUniqueSlug(name: string, existing: { slug: string | null }[]): string {
  const taken = new Set(existing.map(p => p.slug).filter(Boolean) as string[]);
  let slug = slugify(name);
  if (!taken.has(slug)) return slug;
  let counter = 2;
  while (taken.has(`${slug}-${counter}`)) counter++;
  return `${slug}-${counter}`;
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>('overview');
  const { setCurrentPage, user } = useApp();

  const NAV = [
    { id: 'overview' as Section, label: 'Overview', icon: icons.dashboard },
    { id: 'stock' as Section, label: 'Stock', icon: icons.box },
    { id: 'orders' as Section, label: 'Orders', icon: icons.bag },
    { id: 'messages' as Section, label: 'Messages', icon: icons.mail },
    { id: 'newsletter' as Section, label: 'Newsletter', icon: icons.mail },
    { id: 'users' as Section, label: 'Users', icon: icons.users },
  ];

  return (
    <div className="min-h-screen flex pt-16" style={{ background: BG }}>
      <SEO noindex />
      <aside className="fixed left-0 top-16 w-[200px] h-[calc(100vh-64px)] flex flex-col z-40" style={{ background: DARK }}>
        <div className="px-5 py-4 pb-5 border-b border-white/10 mb-2">
          <div className="text-sm font-semibold text-white">Maison Tislit</div>
          <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: GOLD }}>Admin Panel</div>
        </div>
        <nav className="flex-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={cn('w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] transition-all border-l-[3px]',
                section === item.id
                  ? 'font-medium'
                  : 'hover:bg-white/[0.04]')}
              style={{
                color: section === item.id ? GOLD : 'rgba(255,255,255,0.5)',
                borderLeftColor: section === item.id ? GOLD : 'transparent',
                background: section === item.id ? 'rgba(201,168,76,0.08)' : 'transparent',
              }}>
              <I d={item.icon} size={16} color={section === item.id ? GOLD : 'rgba(255,255,255,0.5)'} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-5 py-4 border-t border-white/10">
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Logged in as</div>
          <div className="text-[13px] font-medium text-white mt-0.5">{user?.name || 'Admin'}</div>
          <button onClick={() => setCurrentPage('home')} className="text-[11px] hover:underline mt-1.5" style={{ color: GOLD }}>← Retour au site</button>
        </div>
      </aside>
      <main className="flex-1 ml-[200px] p-6">
        {section === 'overview' && <OverviewSection />}
        {section === 'stock' && <StockSection />}
        {section === 'orders' && <OrdersSection />}
        {section === 'messages' && <MessagesSection />}
        {section === 'newsletter' && <NewsletterSection />}
        {section === 'users' && <UsersSection />}
      </main>
    </div>
  );
}

/* ───── Overview ───── */
function OverviewSection() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
    getOrders().then(setOrders).catch(() => {});
    getMessages().then(setMessages).catch(() => {});
    getProfiles().then(setProfiles).catch(() => {});
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const unreadCount = messages.filter(m => !m.is_read).length;
  const lowStock = products
    .filter(p => p.stock <= 5)
    .filter((p, index, self) => self.findIndex(x => x.name === p.name) === index);
  const recentOrders = orders.slice(0, 5);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const thisMonthRevenue = orders
    .filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + Number(o.total), 0);

  const getCustomerName = (o: OrderRow): string => {
    if (o.user_id) {
      const profile = profiles.find(p => p.id === o.user_id);
      if (profile) return profile.name || profile.email;
      return o.user_id.slice(0, 8);
    }
    if (o.customer_name) return o.customer_name;
    if (o.customer_email) return o.customer_email;
    return 'Guest';
  };

  const markAsShipped = async (id: number) => {
    await updateOrderStatus(id, 'shipped');
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o));
  };

  const openRestock = (productId: number) => {
    setEditProductId(productId);
    setShowStockModal(true);
  };

  const statCards = [
    { label: 'Total products', value: products.length, icon: icons.box, colorKey: 'products', trend: '+2', up: true },
    { label: 'Pending orders', value: pendingOrders, icon: icons.clock, colorKey: 'pending', trend: '+1', up: true },
    { label: 'New messages', value: unreadCount, icon: icons.mail, colorKey: 'messages', trend: '-2', up: false },
    { label: 'Total users', value: profiles.length, icon: icons.users, colorKey: 'users', trend: '+3', up: true },
    { label: 'Revenue (month)', value: `${thisMonthRevenue.toLocaleString('fr-FR')} MAD`, icon: icons.revenue, colorKey: 'revenue', trend: '+12%', up: true },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold" style={{ color: DARK }}>Overview</h1>
        <span className="text-xs" style={{ color: '#999' }}>{today}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {statCards.map(s => {
          const c = STAT_COLORS[s.colorKey];
          return (
            <div key={s.label} className="rounded-xl p-4 relative" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: c.bg, color: c.color }}>
                <I d={s.icon} size={16} color={c.color} />
              </div>
              <div className="text-[11px] mb-1" style={{ color: '#999' }}>{s.label}</div>
              <div className="text-[20px] font-semibold" style={{ color: DARK }}>{s.value}</div>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[11px] font-medium" style={{ color: s.up ? '#22c55e' : '#ef4444' }}>
                  {s.up ? '↑' : '↓'} {s.trend}
                </span>
                <span className="text-[11px]" style={{ color: '#bbb' }}>vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Low Stock */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: '#444' }}>Low stock alerts</div>
            <button className="text-[11px] font-medium hover:underline" style={{ color: GOLD }}>Manage stock →</button>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-xs" style={{ color: '#bbb' }}>Aucune alerte.</p>
          ) : (
            <div className="space-y-1">{lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
                <span className="flex-1 text-sm" style={{ color: '#555' }}>{p.name}</span>
                <Badge variant={p.stock === 0 ? 'danger' : 'warn'}>{p.stock === 0 ? 'Rupture' : `Stock: ${p.stock}`}</Badge>
                <button
                  onClick={() => openRestock(p.id)}
                  className="text-[10px] px-2.5 py-1 rounded-md transition-colors hover:opacity-80"
                  style={{ background: DARK, color: GOLD, border: 'none' }}
                >
                  Restock
                </button>
              </div>
            ))}</div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold" style={{ color: '#444' }}>Recent orders</div>
            <button className="text-[11px] font-medium hover:underline" style={{ color: GOLD }}>View all →</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
                <th className="pb-2 pr-2 font-medium text-left">#</th>
                <th className="pb-2 pr-2 font-medium text-left">Customer</th>
                <th className="pb-2 pr-2 font-medium text-left">Total</th>
                <th className="pb-2 pr-2 font-medium text-left">Status</th>
                <th className="pb-2 font-medium text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-stone-50 last:border-0">
                  <td className="py-2 pr-2 font-medium" style={{ color: '#555' }}>#{o.id}</td>
                  <td className="py-2 pr-2 text-sm" style={{ color: '#777' }}>{getCustomerName(o)}</td>
                  <td className="py-2 pr-2 text-sm font-medium" style={{ color: '#555' }}>{Number(o.total).toLocaleString('fr-FR')} MAD</td>
                  <td className="py-2 pr-2"><StatusBadge status={o.status} /></td>
                  <td className="py-2">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="text-[10px] px-2 py-1 rounded-md transition-colors hover:opacity-80"
                        style={{ background: DARK, color: '#fff', border: 'none' }}
                      >
                        View
                      </button>
                      {o.status === 'pending' && (
                        <button
                          onClick={() => markAsShipped(o.id)}
                          className="text-[10px] px-2 py-1 rounded-md transition-colors hover:opacity-80"
                          style={{ background: DARK, color: GOLD, border: 'none' }}
                        >
                          Ship
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showStockModal && editProductId !== null && (
        <StockEditModal
          productId={editProductId}
          products={products}
          setProducts={setProducts}
          onClose={() => setShowStockModal(false)}
        />
      )}
    </>
  );
}

/* ───── Badges ───── */
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
  const map: Record<OrderStatus, { v: 'warn' | 'info' | 'success'; l: string }> = { pending: { v: 'warn', l: 'En attente' }, shipped: { v: 'info', l: 'Expédié' }, delivered: { v: 'success', l: 'Livré' } };
  return <Badge variant={map[status].v}>{map[status].l}</Badge>;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="danger">Rupture</Badge>;
  if (stock <= 5) return <Badge variant="warn">Faible</Badge>;
  return <Badge variant="success">En stock</Badge>;
}

/* ───── Stock Edit Modal ───── */
function StockEditModal({ productId, products, setProducts, onClose }: { productId: number; products: ProductRow[]; setProducts: (p: ProductRow[]) => void; onClose: () => void }) {
  const product = products.find(p => p.id === productId);
  const [stock, setStock] = useState(product?.stock || 0);

  if (!product) return null;

  const save = async () => {
    await updateProduct(productId, { stock });
    setProducts(products.map(p => p.id === productId ? { ...p, stock } : p));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl p-6 w-[360px] shadow-2xl" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ color: '#444' }}>Restock: {product.name}</div>
          <button onClick={onClose} className="hover:opacity-70" style={{ color: '#999' }}><I d={icons.x} size={18} /></button>
        </div>
        <div className="mb-4">
          <label className="text-xs" style={{ color: '#999' }}>New stock quantity</label>
          <input type="number" min={0} value={stock} onChange={e => setStock(+e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} />
        </div>
        <div className="flex gap-2 justify-end pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} className="px-4 py-2 text-xs rounded-lg" style={{ border: '1px solid #e5e5e5', color: '#666' }}>Cancel</button>
          <button onClick={save} className="px-4 py-2 text-xs rounded-lg" style={{ background: DARK, color: GOLD, border: 'none' }}>Update stock</button>
        </div>
      </div>
    </div>
  );
}

/* ───── Stock ───── */
function StockSection() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryInput, setGalleryInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [form, setForm] = useState({ name: '', name_en: '', category: 'djellaba', price: 0, stock: 0, description: '', description_en: '', sizes: '', colors: '', badge: '', image: '', gallery: [] as string[], videos: [] as string[] });

  useEffect(() => { getProducts().then(setProducts).catch(() => {}); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'gallery' | 'video' = 'image') => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const [index, file] of files.entries()) {
        const path = `products/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm(f => target === 'gallery'
        ? { ...f, gallery: [...f.gallery, ...urls] }
        : target === 'video'
          ? { ...f, videos: [...f.videos, ...urls] }
          : { ...f, image: urls[0] });
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addGalleryImage = (value?: string) => {
    const url = (value ?? galleryInput).trim();
    if (!url) return;
    setForm(f => (f.gallery.includes(url) ? f : { ...f, gallery: [...f.gallery, url] }));
    setGalleryInput('');
  };

  const removeGalleryImage = (index: number) => {
    setForm(f => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  const addVideo = (value?: string) => {
    const url = (value ?? videoInput).trim();
    if (!url) return;
    setForm(f => (f.videos.includes(url) ? f : { ...f, videos: [...f.videos, url] }));
    setVideoInput('');
  };

  const removeVideo = (index: number) => {
    setForm(f => ({ ...f, videos: f.videos.filter((_, i) => i !== index) }));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) && (!catFilter || p.category === catFilter));
  }, [products, search, catFilter]);

  const openAdd = () => { setEditId(null); setGalleryInput(''); setVideoInput(''); setForm({ name: '', name_en: '', category: 'djellaba', price: 0, stock: 0, description: '', description_en: '', sizes: '', colors: '', badge: '', image: '', gallery: [], videos: [] }); setShowModal(true); };
  const openEdit = (p: ProductRow) => { setEditId(p.id); setGalleryInput(''); setVideoInput(''); setForm({ name: p.name, name_en: p.name_en, category: p.category, price: p.price, stock: p.stock, description: p.description, description_en: p.description_en, sizes: p.sizes.join(', '), colors: p.colors.join(', '), badge: p.badge || '', image: p.image, gallery: Array.isArray(p.gallery) ? p.gallery : [], videos: Array.isArray(p.videos) ? p.videos : [] }); setShowModal(true); };

  const saveProduct = async () => {
    if (!form.name.trim()) return alert('Nom requis');
    const data = { ...form, price: Number(form.price), stock: Number(form.stock), sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean), colors: form.colors.split(',').map(s => s.trim()).filter(Boolean), badge: form.badge || null, gallery: form.gallery.map(s => s.trim()).filter(Boolean), videos: form.videos.map(s => s.trim()).filter(Boolean) };
    try {
      if (editId !== null) {
        const existing = products.find(p => p.id === editId);
        const nameChanged = existing && (form.name !== existing.name || form.name_en !== existing.name_en);
        const dataWithSlug = { ...data, slug: nameChanged || !existing?.slug ? buildUniqueSlug(form.name_en || form.name, products.filter(p => p.id !== editId)) : existing.slug };
        await updateProduct(editId, dataWithSlug);
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...dataWithSlug } : p));
      } else {
        const created = await createProduct({ ...data, slug: buildUniqueSlug(form.name_en || form.name, products) } as any);
        setProducts(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err: any) {
      const message: string = err?.message || 'Save failed';
      // Migrations 00029 (gallery) and 00030 (videos) add product columns;
      // PostgREST reports a missing column as a cryptic schema-cache error, so
      alert(/gallery|video/i.test(message) && /schema cache|does not exist/i.test(message)
        ? `${message}\n\nRun ${/video/i.test(message) ? 'supabase/migrations/00030_product_videos.sql' : 'supabase/migrations/00029_product_gallery.sql'} in the Supabase SQL Editor, then save again.`
        : message);
    }
  };

  const deleteProduct_ = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold" style={{ color: DARK }}>Stock management</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}><I d={icons.plus} size={15} color={GOLD} /> Add product</button>
      </div>
      <div className="rounded-xl p-5" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div className="flex gap-2 mb-4">
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-[220px] px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ border: '1px solid #e5e5e5' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="max-w-[140px] px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ border: '1px solid #e5e5e5', background: '#fff' }}>
            <option value="">All categories</option>
            {['djellaba', 'gandoura', 'Caftan'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
              <th className="pb-3 pr-3 font-medium text-left">Product</th>
              <th className="pb-3 pr-3 font-medium text-left">Category</th>
              <th className="pb-3 pr-3 font-medium text-left">Price</th>
              <th className="pb-3 pr-3 font-medium text-left">Stock</th>
              <th className="pb-3 pr-3 font-medium text-left">Status</th>
              <th className="pb-3 font-medium text-left" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="py-2.5 pr-3 font-medium" style={{ color: '#555' }}>
                  {p.name}
                  {(p.gallery?.length ?? 0) > 0 && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#faf8f5', color: GOLD, border: '0.5px solid #e8e2d8' }}>+{p.gallery?.length}</span>
                  )}
                  {(p.videos?.length ?? 0) > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#faf8f5', color: GOLD, border: '0.5px solid #e8e2d8' }}>&#9654; {p.videos?.length}</span>
                  )}
                </td>
                <td className="py-2.5 pr-3"><Badge variant="info">{p.category}</Badge></td>
                <td className="py-2.5 pr-3" style={{ color: '#555' }}>{Number(p.price).toLocaleString('fr-FR')} MAD</td>
                <td className="py-2.5 pr-3 text-sm" style={{ color: '#777' }}>{p.stock}</td>
                <td className="py-2.5 pr-3"><StockBadge stock={p.stock} /></td>
                <td className="py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="hover:opacity-70 p-1 rounded" style={{ color: '#999' }}><I d={icons.edit} size={15} /></button>
                    <button onClick={() => deleteProduct_(p.id)} className="hover:opacity-70 p-1 rounded" style={{ color: '#999' }}><I d={icons.trash} size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)} style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-[520px] shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm font-semibold" style={{ color: '#444' }}>{editId !== null ? 'Edit product' : 'Add product'}</div>
              <button onClick={() => setShowModal(false)} className="hover:opacity-70" style={{ color: '#999' }}><I d={icons.x} size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs" style={{ color: '#999' }}>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
              <div><label className="text-xs" style={{ color: '#999' }}>Name (EN)</label><input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs" style={{ color: '#999' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5', background: '#fff' }}>
                  {['djellaba', 'gandoura', 'Caftan'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-xs" style={{ color: '#999' }}>Price (MAD)</label><input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs" style={{ color: '#999' }}>Stock</label><input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
              <div><label className="text-xs" style={{ color: '#999' }}>Badge</label><input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
            </div>
            <div className="mb-3"><label className="text-xs" style={{ color: '#999' }}>Image</label>
              <div className="flex items-center gap-2 mt-1">
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ border: '1px solid #e5e5e5' }} placeholder="/images/your-image.jpg" />
                <label className="flex-shrink-0 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}>
                  {uploading ? 'Uploading...' : 'Upload image'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 w-16 h-20 object-contain bg-stone-100 rounded-lg" />
              )}
            </div>
            <div className="mb-3">
              <label className="text-xs" style={{ color: '#999' }}>Gallery — extra photos ({form.gallery.length})</label>
              {form.gallery.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {form.gallery.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative">
                      <img src={src} alt="" className="w-16 h-20 object-contain bg-stone-100 rounded-lg" style={{ border: '1px solid #f0f0f0' }} />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        aria-label={`Remove gallery image ${i + 1}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm hover:opacity-90"
                        style={{ background: DARK, border: 'none' }}
                      >
                        <I d={icons.x} size={11} color={GOLD} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  value={galleryInput}
                  onChange={e => setGalleryInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGalleryImage(); } }}
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
                  style={{ border: '1px solid #e5e5e5' }}
                  placeholder="/images/your-image.jpg"
                />
                <button type="button" onClick={() => addGalleryImage()} className="flex-shrink-0 px-3 py-2 text-xs rounded-lg transition-colors hover:opacity-80" style={{ border: '1px solid #e5e5e5', color: '#666', background: '#fff' }}>Add</button>
                <label className="flex-shrink-0 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}>
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" multiple onChange={e => handleUpload(e, 'gallery')} disabled={uploading} className="hidden" />
                </label>
              </div>
              <p className="mt-1.5 text-[10px]" style={{ color: '#bbb' }}>Shown as a thumbnail strip on the product page, after the cover image.</p>
            </div>
            <div className="mb-3">
              <label className="text-xs" style={{ color: '#999' }}>Videos — mp4 clips ({form.videos.length})</label>
              {form.videos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {form.videos.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative">
                      <video src={`${src}#t=0.1`} preload="metadata" muted playsInline className="w-16 h-20 object-contain bg-stone-100 rounded-lg" style={{ border: '1px solid #f0f0f0' }} />
                      <button
                        type="button"
                        onClick={() => removeVideo(i)}
                        aria-label={`Remove video ${i + 1}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm hover:opacity-90"
                        style={{ background: DARK, border: 'none' }}
                      >
                        <I d={icons.x} size={11} color={GOLD} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  value={videoInput}
                  onChange={e => setVideoInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideo(); } }}
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
                  style={{ border: '1px solid #e5e5e5' }}
                  placeholder="/images/HERO.mp4 or a Storage URL"
                />
                <button type="button" onClick={() => addVideo()} className="flex-shrink-0 px-3 py-2 text-xs rounded-lg transition-colors hover:opacity-80" style={{ border: '1px solid #e5e5e5', color: '#666', background: '#fff' }}>Add</button>
                <label className="flex-shrink-0 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}>
                  {uploading ? 'Uploading...' : 'Upload video'}
                  <input type="file" accept="video/mp4,video/webm" multiple onChange={e => handleUpload(e, 'video')} disabled={uploading} className="hidden" />
                </label>
              </div>
              <p className="mt-1.5 text-[10px]" style={{ color: '#bbb' }}>Keep clips short (10-20s, under 20 MB). They play in the big frame with a play badge on the thumbnail.</p>
            </div>
            <div className="mb-3"><label className="text-xs" style={{ color: '#999' }}>Description (FR)</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none resize-y" style={{ border: '1px solid #e5e5e5' }} /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs" style={{ color: '#999' }}>Sizes (comma separated)</label><input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
              <div><label className="text-xs" style={{ color: '#999' }}>Colors (comma separated)</label><input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg mt-1 focus:outline-none" style={{ border: '1px solid #e5e5e5' }} /></div>
            </div>
            <div className="flex gap-2 justify-end mt-4 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs rounded-lg" style={{ border: '1px solid #e5e5e5', color: '#666' }}>Cancel</button>
              <button onClick={saveProduct} className="px-4 py-2 text-xs rounded-lg" style={{ background: DARK, color: GOLD, border: 'none' }}>{editId !== null ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───── Orders ───── */
function OrdersSection() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    getOrders().then(setOrders).catch(() => {});
    getProfiles().then(setProfiles).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const changeStatus = async (id: number, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const getCustomerName = (o: OrderRow): string => {
    if (o.user_id) {
      const profile = profiles.find(p => p.id === o.user_id);
      if (profile) return profile.name || profile.email;
    }
    if (o.customer_name) return o.customer_name;
    if (o.customer_email) return o.customer_email;
    return o.user_id ? o.user_id.slice(0, 8) : 'Guest';
  };

  const tabs = [
    { value: 'all' as const, label: 'All' },
    { value: 'pending' as const, label: 'Pending' },
    { value: 'shipped' as const, label: 'Shipped' },
    { value: 'delivered' as const, label: 'Delivered' },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold" style={{ color: DARK }}>Orders</h1>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className="px-3.5 py-1.5 text-xs rounded-lg transition-colors"
              style={filter === t.value ? { background: DARK, color: GOLD } : { color: '#999', background: 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
              <th className="pb-3 pr-3 font-medium text-left">#</th>
              <th className="pb-3 pr-3 font-medium text-left">Customer</th>
              <th className="pb-3 pr-3 font-medium text-left">Payment</th>
              <th className="pb-3 pr-3 font-medium text-left">Total</th>
              <th className="pb-3 pr-3 font-medium text-left">Date</th>
              <th className="pb-3 pr-3 font-medium text-left">Status</th>
              <th className="pb-3 font-medium text-left" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="py-2.5 pr-3 font-medium" style={{ color: '#555' }}>#{o.id}</td>
                <td className="py-2.5 pr-3 text-sm" style={{ color: '#777' }}>{getCustomerName(o)}</td>
                <td className="py-2.5 pr-3">
                  {o.payment_method === 'whatsapp' ? (
                    <Badge variant="success">WhatsApp</Badge>
                  ) : o.payment_method === 'cod' ? (
                    <Badge variant="warn">COD</Badge>
                  ) : (
                    <Badge variant="info">Carte</Badge>
                  )}
                </td>
                <td className="py-2.5 pr-3 font-medium" style={{ color: '#555' }}>{Number(o.total).toLocaleString('fr-FR')} MAD</td>
                <td className="py-2.5 pr-3 text-xs" style={{ color: '#bbb' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                <td className="py-2.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="text-[10px] px-2.5 py-1 rounded-md transition-colors hover:opacity-80"
                      style={{ background: DARK, color: '#fff', border: 'none' }}
                    >
                      View
                    </button>
                    {o.status === 'pending' && (
                      <button
                        onClick={() => changeStatus(o.id, 'shipped')}
                        className="text-[10px] px-2.5 py-1 rounded-md transition-colors hover:opacity-80"
                        style={{ background: DARK, color: GOLD, border: 'none' }}
                      >
                        Ship
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ───── Messages ───── */
function MessagesSection() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { getMessages().then(setMessages).catch(() => {}); }, []);

  const selected = messages.find(m => m.id === selectedId);

  const openMsg = (id: number) => {
    setSelectedId(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    updateMessage(id, { is_read: true }).catch(() => {});
    const msg = messages.find(m => m.id === id);
    setReplyText(msg?.reply || '');
  };

  const sendReply = () => {
    if (!selected) return;
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, reply: replyText } : m));
    updateMessage(selected.id, { reply: replyText }).catch(() => {});
    alert('Réponse envoyée à ' + selected.email);
  };

  const deleteMsg = async (id: number) => {
    if (!confirm('Supprimer ce message ?')) return;
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6"><h1 className="text-lg font-semibold" style={{ color: DARK }}>Messages</h1></div>
      <div className="grid grid-cols-[240px_1fr] gap-3">
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          {messages.map(m => (
            <button key={m.id} onClick={() => openMsg(m.id)}
              className="w-full text-left px-4 py-3.5 transition-colors border-b border-stone-50 last:border-0"
              style={{ background: !m.is_read ? 'rgba(201,168,76,0.06)' : '#fff' }}>
              <div className="flex items-start justify-between">
                <span className="text-[13px]" style={{ color: !m.is_read ? DARK : '#777', fontWeight: !m.is_read ? 600 : 400 }}>{m.name}</span>
                <span className="text-[11px]" style={{ color: '#bbb' }}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#999' }}>{m.subject}</div>
            </button>
          ))}
        </div>
        <div className="rounded-xl p-5 min-h-[300px]" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          {!selected ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#bbb' }}>Select a message</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="font-semibold text-[15px]" style={{ color: '#444' }}>{selected.subject}</div>
                <div className="text-xs mt-1" style={{ color: '#999' }}>{selected.name} &lt;{selected.email}&gt; &middot; {new Date(selected.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="text-[13px] leading-relaxed mb-5 p-4 rounded-lg" style={{ color: '#555', background: '#faf9f7' }}>{selected.body}</div>
              {selected.reply && (
                <>
                  <div className="text-xs mb-1.5 flex items-center gap-1" style={{ color: '#999' }}><I d={icons.reply} size={12} /> Votre réponse précédente</div>
                  <div className="text-sm pl-3 mb-4" style={{ borderLeft: `2px solid ${GOLD}`, color: '#999' }}>{selected.reply}</div>
                </>
              )}
              <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs" style={{ color: '#999' }}>Répondre</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Votre réponse..." className="px-3 py-2 text-sm rounded-lg resize-y min-h-[60px] focus:outline-none" style={{ border: '1px solid #e5e5e5' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={sendReply} className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-colors hover:opacity-90" style={{ background: DARK, color: GOLD, border: 'none' }}><I d={icons.send} size={14} color={GOLD} /> Envoyer</button>
                <button onClick={() => deleteMsg(selected.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg hover:opacity-80" style={{ color: '#ef4444', background: 'transparent', border: '1px solid #fecaca' }}><I d={icons.trash} size={14} /> Supprimer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ───── Newsletter ───── */
function NewsletterSection() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRow[]>([]);

  useEffect(() => { getNewsletterSubscribers().then(setSubscribers).catch(() => {}); }, []);

  const remove = async (id: number) => {
    if (!confirm('Supprimer cet abonné ?')) return;
    await deleteNewsletterSubscriber(id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold" style={{ color: DARK }}>Newsletter Subscribers</h1>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#eaf3de', color: '#3b6d11' }}>
          {subscribers.length} subscribers
        </span>
      </div>
      <div className="rounded-xl" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
              <th className="p-4 pr-3 font-medium text-left">Email</th>
              <th className="p-4 pr-3 font-medium text-left">Subscribed</th>
              <th className="p-4 font-medium text-left" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="p-4 pr-3" style={{ color: '#555' }}>{s.email}</td>
                <td className="p-4 pr-3 text-xs" style={{ color: '#bbb' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">
                  <button
                    onClick={() => remove(s.id)}
                    className="text-[10px] px-2.5 py-1 rounded-md transition-colors hover:opacity-80"
                    style={{ color: '#ef4444', background: 'transparent', border: '1px solid #fecaca' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-sm" style={{ color: '#bbb' }}>
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ───── Users ───── */
function UsersSection() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => { getProfiles().then(setProfiles).catch(() => {}); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await updateProfile(id, { is_admin: !current });
    setProfiles(prev => prev.map(u => u.id === id ? { ...u, is_admin: !u.is_admin } : u));
  };

  const initials = (n: string) => n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <div className="flex items-center justify-between mb-6"><h1 className="text-lg font-semibold" style={{ color: DARK }}>Users</h1></div>
      <div className="rounded-xl" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider" style={{ color: '#bbb' }}>
              <th className="p-4 pr-3 font-medium text-left">Name</th>
              <th className="p-4 pr-3 font-medium text-left">Email</th>
              <th className="p-4 pr-3 font-medium text-left">Registered</th>
              <th className="p-4 pr-3 font-medium text-left">Role</th>
              <th className="p-4 font-medium text-left" />
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="p-4 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#faeeda', color: '#854f0b' }}>{initials(p.name)}</div>
                    <span style={{ color: '#555' }}>{p.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-sm" style={{ color: '#999' }}>{p.email}</td>
                <td className="py-2.5 pr-3 text-xs" style={{ color: '#bbb' }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="py-2.5 pr-3"><Badge variant={p.is_admin ? 'success' : 'info'}>{p.is_admin ? 'Admin' : 'User'}</Badge></td>
                <td className="py-2.5">
                  <button onClick={() => toggleActive(p.id, p.is_admin)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ border: '1px solid #e5e5e5', color: '#666' }}>
                    {p.is_admin ? 'Revoke admin' : 'Make admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
