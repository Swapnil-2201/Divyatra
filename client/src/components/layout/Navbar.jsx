import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCrowd } from '../../context/CrowdContext';
import { useBooking } from '../../context/BookingContext';
import { useNotification } from '../../context/NotificationContext';
import { Logo } from '../common/Logo';
import { NavbarSearch } from './NavbarSearch';
import {
  User,
  Shield,
  Menu,
  X,
  Search,
  Ticket,
  ChevronRight,
  ShoppingBag,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Users,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिन्दी' },
  { code: 'gu', label: 'ગુ', full: 'ગુજરાતી' },
];

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, isAdmin, isAuthority } = useAuth();
  const { crowdData } = useCrowd();
  const { draftBooking } = useBooking();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: t('nav.temples'), path: '/temples' },
    { name: t('nav.planYatra'), path: '/plan-yatra' },
    { name: t('nav.liveDarshan'), path: '/live-darshan' },
    { name: t('nav.liveCrowd'), path: '/live-crowd' },
    { name: t('nav.bookDarshan'), path: '/booking' },
    { name: t('nav.prasad'), path: '/prasad' },
  ];

  const totalPrasadCount = draftBooking.prasadCart.reduce((s, i) => s + i.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/temples?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const getNotifIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Ticket className="w-4 h-4 text-emerald-600" />;
      case 'darshan':
        return <Flame className="w-4 h-4 text-[#E97820]" />;
      case 'crowd':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />;
      default:
        return <Bell className="w-4 h-4 text-[#102A56]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBE5D8] shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <Logo size="default" />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 rounded-md text-[13.5px] font-medium transition-colors ${
                    active
                      ? 'text-[#E97820] bg-orange-50'
                      : 'text-slate-600 hover:text-[#102A56] hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#E97820] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Language Selector (Desktop / Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#102A56] hover:bg-slate-50 transition-colors min-h-[36px]"
                title="Select language"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLang.label}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E5DED0] rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between min-h-[40px] ${
                        i18n.language === lang.code
                          ? 'bg-orange-50 text-[#E97820] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.full}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-[#102A56] hover:bg-slate-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={t('nav.search')}
              aria-label={t('nav.search')}
            >
              <Search className="w-4 h-4 text-slate-600" />
            </button>

            {/* In-app Notification Bell with Badge */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 sm:p-2 text-slate-600 hover:text-[#102A56] hover:bg-slate-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute 0.5 top-0.5 right-0.5 w-3.5 h-3.5 bg-[#E97820] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-20px)] sm:w-96 max-w-sm bg-white border border-[#E5DED0] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3.5 bg-[#102A56] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D5A63A]" />
                      <strong className="text-xs font-bold font-serif">In-App Notifications</strong>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-[#D5A63A] hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {!user ? (
                      <div className="p-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#E97820] flex items-center justify-center mx-auto">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-[#102A56] block">
                            Sign In to View Notifications
                          </strong>
                          <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                            Sign in with your Pilgrim or Authority account to access your live E-Pass confirmations and Darshan reminders.
                          </p>
                        </div>
                        <Link
                          to="/login"
                          onClick={() => setNotifOpen(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#102A56] text-white text-xs font-bold hover:bg-[#1B3B74] shadow transition-all"
                        >
                          <User className="w-3.5 h-3.5 text-[#E97820]" />
                          <span>Sign In to Portal</span>
                        </Link>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => {
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                              notif.read ? 'bg-white opacity-70' : 'bg-orange-50/40'
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-gray-50 shrink-0 mt-0.5">
                              {getNotifIcon(notif.type)}
                            </div>

                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <strong className="font-semibold text-[#102A56]">
                                  {notif.title}
                                </strong>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                {notif.message}
                              </p>
                              {notif.actionUrl && (
                                <Link
                                  to={notif.actionUrl}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setNotifOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-[#E97820] hover:underline block pt-1"
                                >
                                  View Details &rarr;
                                </Link>
                              )}
                            </div>

                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                title="Mark read"
                                className="p-1 hover:bg-orange-100 rounded text-gray-400 hover:text-gray-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live devotee count (Desktop/Tablet) */}
            <Link
              to="/live-crowd"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all"
              title="Live pilgrims"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
              <span>{crowdData?.totalActivePilgrims?.toLocaleString() || '—'}</span>
            </Link>

            {/* Prasad Cart (Hidden on tiny screens unless items added) */}
            <Link
              to="/prasad"
              className={`relative p-1.5 sm:p-2 text-slate-600 hover:text-[#102A56] hover:bg-slate-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] items-center justify-center ${
                totalPrasadCount > 0 ? 'flex' : 'hidden sm:flex'
              }`}
              title={t('nav.prasad')}
            >
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              {totalPrasadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#E97820] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalPrasadCount}
                </span>
              )}
            </Link>

            {/* User Auth Button */}
            <div className="flex items-center pl-0.5 xs:pl-1 border-l border-slate-200">
              {!user ? (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1 px-2 xs:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#102A56] hover:bg-[#1B3B74] transition-all shadow-sm min-h-[36px]"
                  title="Sign In / Login"
                >
                  <User className="w-3.5 h-3.5 text-[#E97820]" />
                  <span className="hidden xs:inline">Login</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1">
                  {isAdmin || isAuthority ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold bg-[#102A56] text-white hover:bg-[#1B3B74] transition-all shadow-sm min-h-[36px]"
                      title="Command Center"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#D5A63A]" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 border border-orange-200 text-[#102A56] min-h-[36px]">
                      <User className="w-3.5 h-3.5 text-[#E97820]" />
                      <span className="hidden sm:inline font-medium">{user.name?.split(' ')[0] || 'Devotee'}</span>
                    </div>
                  )}

                  <button
                    onClick={logout}
                    className="hidden sm:inline-block px-2 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Relative Search Dropdown */}
      <NavbarSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#EBE5D8] bg-white px-4 py-4 space-y-3 animate-fadeIn shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          
          {/* Mobile Language Switcher */}
          <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EBE4D5] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E97820]" />
              Language / ભાષા / भाषा
            </span>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    i18n.language === lang.code
                      ? 'bg-[#102A56] text-white shadow-sm'
                      : 'bg-white border border-[#E5DED0] text-slate-700 hover:bg-gray-50'
                  }`}
                >
                  {lang.full}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                  isActive(link.path)
                    ? 'text-[#E97820] bg-orange-50 font-semibold border-l-4 border-[#E97820]'
                    : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>

          {/* User Auth / Action in Drawer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#102A56] text-white font-bold text-xs shadow transition-colors min-h-[42px]"
              >
                <User className="w-4 h-4 text-[#E97820]" />
                <span>Sign In to Pilgrim Portal</span>
              </Link>
            ) : (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E97820]" />
                  <span className="text-xs font-bold text-[#102A56]">{user.name || 'Devotee'}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-sahayak'));
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#102A56] bg-amber-50/90 border border-amber-200/80 min-h-[42px] transition-all hover:bg-amber-100"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E97820]" />
                <span>Ask Divya Sahayak 2.0 AI</span>
              </div>
              <span className="text-[10px] bg-[#E97820] text-white px-2 py-0.5 rounded-full font-bold">24x7 Guide</span>
            </button>

            <Link
              to="/emergency-help"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-200 min-h-[42px]"
            >
              <span>Need Help? SOS Helplines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#102A56] min-h-[42px]"
              >
                <span>Authority Command Center</span>
                <ChevronRight className="w-4 h-4 text-[#D5A63A]" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
