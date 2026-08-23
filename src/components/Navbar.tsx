import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';

export default function Navbar() {
  const { currentPage, setCurrentPage, user, isAdmin, logout, cartCount, wishlist, currency, setCurrency } = useApp();
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (label: string, page: Parameters<typeof setCurrentPage>[0]) => (
    <button
      onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
      className={`relative font-medium text-sm tracking-widest uppercase transition-all duration-200 pb-1 hover:text-brand
        ${currentPage === page ? 'text-brand after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand' : 'text-stone-700'}`}
    >
      {label}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => setCurrentPage('home')}
            className="flex items-center"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/images/logo.webp"
              alt="Maison Tislit"
              width={256}
              height={256}
              className="h-[140px] w-auto object-contain drop-shadow-sm transition-all duration-300"
            />
            <span className="sr-only">Maison Tislit</span>
          </motion.button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLink(t('nav.home'), 'home')}
            {navLink(t('nav.shop'), 'shop')}
            {navLink(t('nav.about'), 'about')}
            {navLink(t('nav.contact'), 'contact')}
            {isAdmin && (
              <button onClick={() => setCurrentPage('admin')}
                className="text-[10px] tracking-widest uppercase text-brand hover:text-brand transition-colors font-medium">
                Admin
              </button>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLocale(locale === 'nl' ? 'en' : 'nl')}
              className="text-xs font-bold tracking-wider uppercase px-2 py-1 border border-stone-300 rounded text-stone-600 hover:border-brand hover:text-brand transition-colors"
              aria-label="Toggle language"
            >
              {locale === 'nl' ? 'EN' : 'NL'}
            </button>

            {/* Currency Toggle */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="text-xs font-bold tracking-wider uppercase px-2 py-1.5 border border-stone-300 rounded text-stone-600 bg-transparent hover:border-brand hover:text-brand transition-colors focus:outline-none cursor-pointer"
            >
              <option value="MAD">MAD</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>

            {/* Wishlist */}
            <button
              data-target="wishlist-icon"
              onClick={() => setCurrentPage('favorites')}
              className="relative p-2 text-stone-700 hover:text-brand transition-colors"
              aria-label={t('account.favorites')}
            >
              <Heart size={20} className={wishlist.length > 0 ? 'fill-brand text-brand' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              data-target="cart-icon"
              onClick={() => setCurrentPage('cart')}
              className="relative p-2 text-stone-700 hover:text-brand transition-colors"
              aria-label={t('nav.cart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage('account')}
                  className="flex items-center gap-2 text-sm text-stone-700 hover:text-brand transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand border border-brand flex items-center justify-center">
                    <span className="text-brand text-xs font-semibold">{user.name[0]}</span>
                  </div>
                  <span className="font-medium text-xs tracking-wide">{user.name.split(' ')[0]}</span>
                </button>
                {isAdmin && (
                  <button onClick={() => { setCurrentPage('admin'); setMenuOpen(false); }}
                    className="text-[10px] tracking-widest uppercase text-brand hover:text-brand transition-colors font-medium">
                    Admin
                  </button>
                )}
                <button
                  onClick={logout}
                  className="text-xs text-stone-500 hover:text-red-600 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-stone-700"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-stone-200 py-4 flex flex-col gap-4 px-2">
              {navLink(t('nav.home'), 'home')}
            {navLink(t('nav.shop'), 'shop')}
            {navLink(t('nav.about'), 'about')}
            {navLink(t('nav.contact'), 'contact')}
            {isAdmin && (
              <button onClick={() => { setCurrentPage('admin'); setMenuOpen(false); }} className="text-left text-xs tracking-widest uppercase text-brand font-medium">
                Admin
              </button>
            )}
            {user ? (
              <>
                {navLink(t('nav.myAccount'), 'account')}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-sm text-red-600">
                  {t('nav.logout')}
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
