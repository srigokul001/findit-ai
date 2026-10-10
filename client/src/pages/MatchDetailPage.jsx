import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Tag,
  Layers,
  ArrowLeftRight,
  Info,
} from 'lucide-react';
import { matchAPI } from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import ClaimModal from '../components/ClaimModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const MatchDetailPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await matchAPI.getMatchById(id);
      if (res.data.success) {
        setMatch(res.data.match);
      }
    } catch (err) {
      toast.error('Failed to load match details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const handleDismiss = async () => {
    try {
      await matchAPI.updateStatus(id, 'DISMISSED');
      toast.info('Match dismissed from your active queue.');
      navigate('/matches');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <LoadingSpinner text="Analyzing algorithmic similarity..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Match Record Not Found</h2>
        <Link
          to="/matches"
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
        >
          Back to Matches
        </Link>
      </div>
    );
  }

  const lost = match.lostReportId;
  const found = match.foundReportId;
  const breakdown = match.breakdown || {};

  return (
    <div className="flex-1 py-10 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/matches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Matches
          </Link>
        </div>

        {/* Hero Score Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-700">
                  Algorithmic Evaluation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Similarity Score: {match.score}%
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                Evaluated against category compatibility, brand tokens, color synonyms, description
                text, campus location, and incident timeline.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <MatchScoreBadge score={match.score} size="lg" />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Dismiss Match
                </button>
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Claim Found Item
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Score Bars */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Scoring Breakdown Matrix (100 Point Scale)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Category */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Category Match</span>
                  <span className="text-cyan-600 font-bold">{breakdown.categoryScore || 0} / 25 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.categoryScore || 0) / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Name & Brand */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Name &amp; Brand</span>
                  <span className="text-cyan-600 font-bold">{breakdown.nameBrandScore || 0} / 25 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.nameBrandScore || 0) / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Color */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Color Similarity</span>
                  <span className="text-cyan-600 font-bold">{breakdown.colorScore || 0} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.colorScore || 0) / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Description Keywords</span>
                  <span className="text-cyan-600 font-bold">{breakdown.descriptionScore || 0} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.descriptionScore || 0) / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Campus Location</span>
                  <span className="text-cyan-600 font-bold">{breakdown.locationScore || 0} / 10 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.locationScore || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Timeline / Date</span>
                  <span className="text-cyan-600 font-bold">{breakdown.dateScore || 0} / 10 pts</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.dateScore || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons & Differences Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Reasons */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Why These Match (Positive Signals)</h3>
            </div>
            {match.matchingReasons?.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-slate-700">
                {match.matchingReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No strong specific positive signals recorded.</p>
            )}
          </div>

          {/* Differences */}
          <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Differences Noted</h3>
            </div>
            {match.differences?.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-slate-700">
                {match.differences.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No major discrepancies detected between reports.</p>
            )}
          </div>
        </div>

        {/* Side-by-Side Detailed Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <h3 className="text-base font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-600" />
            Side-by-Side Comparison
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Lost Report Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white">
                  Lost Item
                </span>
                <Link
                  to={`/reports/${lost._id}`}
                  className="text-xs font-semibold text-rose-700 hover:underline"
                >
                  View Full Report &rarr;
                </Link>
              </div>

              <img
                src={lost.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400'}
                alt=""
                className="w-full h-44 rounded-xl object-cover border border-slate-200"
              />

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Item Name</span>
                  <p className="font-bold text-slate-900 text-sm">{lost.itemName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                    <p className="font-semibold text-slate-800">{lost.category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Brand</span>
                    <p className="font-semibold text-slate-800">{lost.brand || 'Unspecified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Color</span>
                    <p className="font-semibold text-slate-800">{lost.color || 'Unspecified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Lost</span>
                    <p className="font-semibold text-slate-800">{new Date(lost.reportDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <p className="font-semibold text-slate-800">{lost.location}</p>
                  {lost.specificLocation && (
                    <p className="text-slate-500 text-[11px]">{lost.specificLocation}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Description</span>
                  <p className="text-slate-600 leading-relaxed">{lost.description}</p>
                </div>
              </div>
            </div>

            {/* Found Report Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-600 text-white">
                  Found Item
                </span>
                <Link
                  to={`/reports/${found._id}`}
                  className="text-xs font-semibold text-cyan-700 hover:underline"
                >
                  View Full Report &rarr;
                </Link>
              </div>

              <img
                src={found.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400'}
                alt=""
                className="w-full h-44 rounded-xl object-cover border border-slate-200"
              />

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Item Name</span>
                  <p className="font-bold text-slate-900 text-sm">{found.itemName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                    <p className="font-semibold text-slate-800">{found.category}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Brand</span>
                    <p className="font-semibold text-slate-800">{found.brand || 'Unspecified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Color</span>
                    <p className="font-semibold text-slate-800">{found.color || 'Unspecified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Found</span>
                    <p className="font-semibold text-slate-800">{new Date(found.reportDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <p className="font-semibold text-slate-800">{found.location}</p>
                  {found.specificLocation && (
                    <p className="text-slate-500 text-[11px]">{found.specificLocation}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Description</span>
                  <p className="text-slate-600 leading-relaxed">{found.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Modal instance */}
        <ClaimModal
          item={found}
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => {
            fetchMatch();
          }}
        />
      </div>
    </div>
  );
};

export default MatchDetailPage;
