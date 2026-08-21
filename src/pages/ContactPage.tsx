import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Store, Newspaper, Headphones } from 'lucide-react';
import { useScrollReveal } from '../utils/animations';
import { supabase } from '../supabase/client';
import Captcha from '../components/Captcha';
import SEO from '../components/SEO';

export default function ContactPage() {
  const { t } = useTranslation();
  const { showToast } = useApp();
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState('');
  const mountedAt = useRef(Date.now());
  const infoRef = useScrollReveal<HTMLDivElement>();
  const supportRef = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const form = new FormData(formRef.current);

    if (form.get('_hp')) return;
    if (Date.now() - mountedAt.current < 4000) return;
    if (!captchaToken) {
      showToast(t('security.captchaRequired'), 'error');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-message', {
        body: {
          name: form.get('name') as string,
          email: form.get('email') as string,
          subject: form.get('subject') as string,
          body: form.get('message') as string,
          captchaToken,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      showToast(t('contact.success'), 'success');
      formRef.current.reset();
      setCooldown(90);
    } catch {
      showToast(t('contact.error'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-20">
      <SEO title={t('seo.contactTitle')} description={t('seo.contactDescription')} />
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden bg-brand" style={{ height: '50vh', minHeight: '400px' }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 text-center px-6 hero-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-white/50" />
            <span className="text-xs tracking-[0.4em] uppercase font-light text-white">
              {t('contact.label')}
            </span>
            <div className="h-px w-16 bg-white/50" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('contact.title')}
          </h1>
          <p className="text-stone-200 text-lg max-w-xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Atelier + Form */}
      <section className="py-16 px-6" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" ref={infoRef}>
            {/* Left: Atelier Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('contact.atelier')}
                </h2>
                <div className="h-px w-12 bg-brand" />
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-brand">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-stone-700 font-medium text-sm">{t('contact.addressLine1')}</p>
                    <p className="text-stone-500 text-xs">{t('footer.address')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-brand">
                    <Phone size={18} />
                  </div>
                  <div>
                    <a href="tel:+31620813588" className="text-brand font-medium text-sm hover:underline">{t('contact.phone')}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-brand">
                    <Mail size={18} />
                  </div>
                  <div>
                    <a href="mailto:maisontislit@gmail.com" className="text-brand font-medium text-sm hover:underline">
                      maisontislit@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-brand">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-stone-700 font-medium text-sm">{t('contact.hours')}</p>
                    <p className="text-stone-500 text-xs">{t('contact.saturday')}</p>
                    <p className="text-stone-500 text-xs italic">{t('contact.sunday')}</p>
                    <p className="text-stone-500 text-xs mt-1 italic">{t('contact.appointment')}</p>
                  </div>
                </div>
              </div>

              {/* Photo */}
              <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '4/3' }}>
                <picture>
                  <source srcSet="/images/ccc.webp" type="image/webp" />
                  <img
                    src="/images/ccc.jpg"
                    alt="Atelier"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-stone-50 rounded-xl p-8 md:p-10 border border-stone-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('contact.formTitle')}
                </h2>
                <p className="text-stone-500 text-sm">{t('contact.formDesc')}</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                    {t('contact.name')}
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand transition-colors"
                    placeholder={t('contact.name')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                    {t('contact.emailLabel')}
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                    {t('contact.subject')}
                  </label>
                  <select
                    name="subject"
                    required
                    className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-sm text-stone-800 focus:outline-none focus:border-brand transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">—</option>
                    <option value={t('contact.subjectGeneral')}>{t('contact.subjectGeneral')}</option>
                    <option value={t('contact.subjectCustom')}>{t('contact.subjectCustom')}</option>
                    <option value={t('contact.subjectWholesale')}>{t('contact.subjectWholesale')}</option>
                    <option value={t('contact.subjectPress')}>{t('contact.subjectPress')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 tracking-wider uppercase mb-2">
                    {t('contact.message')}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand transition-colors resize-none"
                    placeholder={t('contact.message')}
                  />
                </div>

                <input name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <Captcha onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

                <button
                  type="submit"
                  disabled={sending || cooldown > 0 || !captchaToken}
                  className="w-full py-4 text-sm tracking-widest uppercase font-medium text-white bg-brand hover:bg-brand-dark transition-all duration-300 disabled:opacity-50"
                >
                  {sending ? t('contact.sending') : t('contact.send')}
                </button>
                {cooldown > 0 && (
                  <p className="text-xs text-stone-500 text-center mt-2">
                    Please wait {cooldown}s before sending again
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Support Links */}
      <section className="py-16 px-6 border-t border-stone-200 bg-brand" ref={supportRef}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left p-6">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 text-[#45381e]">
                <Store size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wide" style={{ fontFamily: "'Playfair Display', serif", color: '#45381e' }}>
                  {t('contact.wholesale')}
                </h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#45381e' }}>{t('contact.wholesaleDesc')}</p>
              <a
                href="mailto:maisontislit@gmail.com"
                className="text-sm font-medium border-b transition-all"
                style={{ color: '#45381e', borderColor: '#45381e' }}
              >
                maisontislit@gmail.com
              </a>
            </div>

            <div className="text-center md:text-left p-6">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 text-[#45381e]">
                <Newspaper size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wide" style={{ fontFamily: "'Playfair Display', serif", color: '#45381e' }}>
                  {t('contact.press')}
                </h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#45381e' }}>{t('contact.pressDesc')}</p>
              <a
                href="mailto:maisontislit@gmail.com"
                className="text-sm font-medium border-b transition-all"
                style={{ color: '#45381e', borderColor: '#45381e' }}
              >
                maisontislit@gmail.com
              </a>
            </div>

            <div className="text-center md:text-left p-6">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3 text-[#45381e]">
                <Headphones size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wide" style={{ fontFamily: "'Playfair Display', serif", color: '#45381e' }}>
                  {t('contact.concierge')}
                </h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#45381e' }}>{t('contact.conciergeDesc')}</p>
              <a
                href="mailto:maisontislit@gmail.com"
                className="text-sm font-medium border-b transition-all"
                style={{ color: '#45381e', borderColor: '#45381e' }}
              >
                maisontislit@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
