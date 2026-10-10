import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  FileQuestion,
  HelpCircle,
  PlusCircle,
  Laptop,
  CreditCard,
  Briefcase,
  Key,
  BookOpen,
  Watch,
  Shirt,
  Compass,
} from 'lucide-react';
import { reportAPI, matchAPI, adminAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { name: 'Electronics', icon: Laptop, count: 'Phones, Laptops, Audio' },
  { name: 'ID Cards', icon: CreditCard, count: 'Badges, Passports, Licenses' },
  { name: 'Wallets', icon: CreditCard, count: 'Bifolds, Pouches, Cards' },
  { name: 'Bags', icon: Briefcase, count: 'Backpacks, Totes, Duffels' },
  { name: 'Keys', icon: Key, count: 'Dorm Keys, Fobs, Lanyards' },
  { name: 'Books', icon: BookOpen, count: 'Textbooks, Notebooks, Planners' },
  { name: 'Accessories', icon: Watch, count: 'Watches, Glasses, Bottles' },
  { name: 'Clothing', icon: Shirt, count: 'Jackets, Hoodies, Hats' },
];

export const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalReports: 12,
    totalMatches: 8,
    returnedItems: 1,
    recoveryRate: 85,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimItem, setSelectedClaimItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [repRes, statsRes] = await Promise.allSettled([
          reportAPI.getReports({ limit: 6, sort: 'newest' }),
          adminAPI.getStats(),
        ]);

        if (repRes.status === 'fulfilled' && repRes.value.data.success) {
          setRecentItems(repRes.value.data.reports || []);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.stats || stats);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Subtle decorative glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-cyan-300 mb-6 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered Multi-Attribute Campus Matching Engine</span>
          </div>

          {/* Headline & Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Lost Something?{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-white bg-clip-text text-transparent">
              Let&apos;s Find It.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Smart matching. Faster recovery. Safer returns. Reconnecting students with lost valuables
            across campus with verified algorithmic precision.
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl shadow-cyan-900/30 border border-slate-200"
            >
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost items (e.g. 'iPhone 14', 'AirPods', 'Library wallet', 'North Face')..."
                className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold text-sm shadow-md transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Two Prominent Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report/lost"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 shadow-lg shadow-rose-600/30 transition hover:scale-102"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-400/30 transition hover:scale-102"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              Report Found Item
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 transition"
            >
              Browse All Items
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section (Floating Cards) */}
      <section className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Reports
              </span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.totalReports || 12}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lost &amp; found logged</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Potential Matches
              </span>
              <Sparkles className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-600">
              {stats.totalMatches || 8}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Algorithmic suggestions</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Items Returned
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {stats.returnedItems || 1}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Reunited with owners</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recovery Rate
              </span>
              <TrendingUp className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-sky-600">
              {stats.recoveryRate ? `${stats.recoveryRate}%` : '85%'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Campus resolution rate</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How FindIt AI Works
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Smart algorithms eliminate lost-and-found chaos. From quick report to verified handover in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition" />
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-inner">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log what you lost or found. Provide category, brand, color, campus location, date, and
                photos with our structured smart reporting forms.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-inner">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Match</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our multi-attribute similarity engine compares names, descriptions, locations, and
                timelines to calculate transparent similarity scores from 0 to 100%.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition" />
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-lg mb-6 shadow-inner">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Recover</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit private identifying proof (passcodes, serials, secret marks) kept hidden from
                the public. Once verified, recover your item securely at campus security or front desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">
                Categories
              </h3>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Browse by Item Category
              </h2>
            </div>
            <Link
              to="/browse"
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View all items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/browse?category=${encodeURIComponent(cat.name)}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50/70 border border-slate-200/70 hover:border-cyan-300 text-center flex flex-col items-center justify-center transition group shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-cyan-600 group-hover:border-cyan-200 group-hover:scale-110 transition shadow-xs mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-800 transition">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-1">
                Live Campus Feed
              </h3>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recently Reported Items
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time submissions from students and campus staff.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/browse?reportType=LOST"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
              >
                Lost Items
              </Link>
              <Link
                to="/browse?reportType=FOUND"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition"
              >
                Found Items
              </Link>
              <Link
                to="/browse"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                View All
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching live items..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onClaimClick={(item) => setSelectedClaimItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Smart Match Spotlight Callout */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Transparent Similarity Scoring
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                How Our Smart Matching Engine Analyzes Items
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                FindIt AI combines 6 weighted criteria to evaluate potential matches. You receive a
                transparent percentage score and a clear explanation of what aligned and what differed.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                  <span className="font-medium text-slate-200">Category &amp; Compatibility</span>
                  <span className="font-bold text-cyan-400">25% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                  <span className="font-medium text-slate-200">Item Name &amp; Brand Matching</span>
                  <span className="font-bold text-cyan-400">25% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                  <span className="font-medium text-slate-200">Color Synonyms &amp; Description Keywords</span>
                  <span className="font-bold text-cyan-400">30% Weight</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                  <span className="font-medium text-slate-200">Campus Location &amp; Date Proximity</span>
                  <span className="font-bold text-cyan-400">20% Weight</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/matches"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
                >
                  Explore Potential Matches
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Demo Card */}
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 font-mono ml-2">Smart Match Matrix</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  92% Match Probability
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                    Lost Report #104
                  </span>
                  <p className="font-bold text-white text-sm">Apple iPhone 14 Pro (Space Black)</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Central Library &bull; Reported 3 days ago
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                    Found Report #108
                  </span>
                  <p className="font-bold text-white text-sm">iPhone 14 with Black Case</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Central Library 2nd Floor &bull; Found 2 days ago
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700 space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Exact category match: Electronics</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Brand matched: Apple (Model: iPhone 14)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Location aligned: Central Library</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Modal instance */}
      <ClaimModal
        item={selectedClaimItem}
        isOpen={!!selectedClaimItem}
        onClose={() => setSelectedClaimItem(null)}
        onSuccess={() => {
          setSelectedClaimItem(null);
        }}
      />
    </div>
  );
};

export default LandingPage;
