import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Tag,
  ArrowLeftRight,
} from 'lucide-react';
import { matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Electronics',
  'ID Cards',
  'Wallets',
  'Bags',
  'Keys',
  'Books',
  'Accessories',
  'Clothing',
  'Other',
];

export const MatchesPage = () => {
  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('reportId');

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(30);
  const [category, setCategory] = useState('All');
  const [myOnly, setMyOnly] = useState(false);

  // Claim modal state
  const [claimItem, setClaimItem] = useState(null);

  const { isAuthenticated } = useAuth();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = {
        minScore,
        category: category !== 'All' ? category : undefined,
        reportId: reportIdParam || undefined,
        myMatches: myOnly ? 'true' : undefined,
      };

      const res = await matchAPI.getMatches(params);
      if (res.data.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [minScore, category, myOnly, reportIdParam]);

  return (
    <div className="flex-1 py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Smart Multi-Attribute Similarity Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Potential Item Matches
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated comparisons calculated between registered lost reports and found reports.
            </p>
          </div>

          {/* Transparent Algorithm Note */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 max-w-sm">
            <span className="font-bold text-slate-900 block mb-0.5">Disclaimer:</span>
            Scores indicate statistical similarity. They are potential suggestions and do not constitute
            proof of ownership until verified with private proof.
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Match Score Threshold */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Similarity Threshold:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setMinScore(30)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  minScore === 30 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All (&ge;30%)
              </button>
              <button
                onClick={() => setMinScore(50)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  minScore === 50 ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Moderate (&ge;50%)
              </button>
              <button
                onClick={() => setMinScore(75)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  minScore === 75 ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                High Probability (&ge;75%)
              </button>
            </div>
          </div>

          {/* Category Filter & My Items Switch */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={myOnly}
                  onChange={(e) => setMyOnly(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                My Items Only
              </label>
            )}
          </div>
        </div>

        {/* Matches Feed */}
        {loading ? (
          <LoadingSpinner text="Computing smart matches..." />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Matches Found"
            description="No active reports currently cross the selected similarity threshold. When new items are submitted, FindIt AI will re-evaluate matches."
            actionText="Browse All Items"
            actionLink="/browse"
          />
        ) : (
          <div className="space-y-6">
            {matches.map((match) => {
              const lost = match.lostReportId;
              const found = match.foundReportId;
              if (!lost || !found) return null;

              return (
                <div
                  key={match._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Top Header: Score & Pair Summary */}
                  <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MatchScoreBadge score={match.score} size="lg" />
                      <span className="text-xs font-semibold text-slate-500">
                        Calculated Match Analysis
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setClaimItem(found)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Submit Claim
                      </button>
                      <Link
                        to={`/matches/${match._id}`}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1"
                      >
                        Deep Comparison &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Container */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Middle Indicator Icon for Desktop */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-cyan-600 font-bold">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>

                    {/* Left: Lost Item Card */}
                    <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white">
                            Lost Item Report
                          </span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-rose-500" />
                            {lost.category}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={lost.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300'}
                            alt={lost.itemName}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-rose-200/60"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">
                              {lost.itemName}
                            </h3>
                            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                              {lost.brand && <p>Brand: <strong className="text-slate-700">{lost.brand}</strong></p>}
                              {lost.color && <p>Color: <strong className="text-slate-700">{lost.color}</strong></p>}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {lost.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {lost.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(lost.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Right: Found Item Card */}
                    <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-600 text-white">
                            Found Item Report
                          </span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-cyan-500" />
                            {found.category}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={found.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300'}
                            alt={found.itemName}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-cyan-200/60"
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">
                              {found.itemName}
                            </h3>
                            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                              {found.brand && <p>Brand: <strong className="text-slate-700">{found.brand}</strong></p>}
                              {found.color && <p>Color: <strong className="text-slate-700">{found.color}</strong></p>}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {found.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-cyan-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                          {found.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(found.reportDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matching Reasons Summary */}
                  {match.matchingReasons?.length > 0 && (
                    <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
                      <span className="font-bold text-slate-700">Matching Attributes:</span>
                      {match.matchingReasons.slice(0, 3).map((reason, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={claimItem}
        isOpen={!!claimItem}
        onClose={() => setClaimItem(null)}
        onSuccess={() => {
          setClaimItem(null);
          fetchMatches();
        }}
      />
    </div>
  );
};

export default MatchesPage;
