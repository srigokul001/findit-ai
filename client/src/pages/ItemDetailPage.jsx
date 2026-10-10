import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Lock,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import ClaimModal from '../components/ClaimModal';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getReportById(id);
      if (res.data.success) {
        setReport(res.data.report);
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      toast.error('Could not load item details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await reportAPI.deleteReport(id);
      toast.success('Report deleted successfully.');
      navigate('/browse');
    } catch (err) {
      toast.error('Failed to delete report.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <LoadingSpinner text="Loading report specifications..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This report may have been deleted or archived.
        </p>
        <Link
          to="/browse"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  const isOwner = user && report.reporterId && user._id === report.reporterId._id;
  const canManage = isOwner || isAdmin;
  const isLost = report.reportType === 'LOST';
  const isReturned = report.status === 'RETURNED';

  const formattedDate = new Date(report.reportDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 py-10 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to previous page
          </button>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Report
              </button>
            </div>
          )}
        </div>

        {/* Main Grid: Details Left, Photo & Actions Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Specs & Overview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              {/* Type and Status Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                {isReturned ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Returned to Owner
                  </span>
                ) : isLost ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                    Lost Item Report
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-600 text-white shadow-sm">
                    Found Item Report
                  </span>
                )}

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-600" />
                  {report.category}
                </span>

                {report.status === 'PENDING_CLAIM' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Verification In Progress
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {report.itemName}
              </h1>

              {/* Brand and Color pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {report.brand && (
                  <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg">
                    Brand: {report.brand}
                  </span>
                )}
                {report.color && (
                  <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg">
                    Color: {report.color}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {report.description}
                </p>
              </div>

              {/* Location & Timeline details */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Campus Location
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{report.location}</p>
                  {report.specificLocation && (
                    <p className="text-slate-500 text-xs mt-0.5">{report.specificLocation}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      {isLost ? 'Date Lost' : 'Date Found'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{formattedDate}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Logged on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Storage location for found items */}
              {!isLost && report.storageLocation && (
                <div className="mt-4 p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-900 block">
                      Physical Custody / Handover Location
                    </span>
                    <p className="text-xs font-semibold text-cyan-950 mt-0.5">
                      {report.storageLocation}
                    </p>
                  </div>
                </div>
              )}

              {/* Private Identifying Details (Only shown if owner or admin) */}
              {report.identifyingDetails && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private Identifying Key (Only visible to you &amp; admin)</span>
                  </div>
                  <p className="text-amber-950 font-mono text-[11px] bg-white/70 p-2 rounded-lg border border-amber-200/70">
                    {report.identifyingDetails}
                  </p>
                </div>
              )}
            </div>

            {/* Smart Matches Accordion Section for this Item */}
            {matches.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <h3 className="font-extrabold text-base text-slate-900">
                      Algorithmic Matches for this Item ({matches.length})
                    </h3>
                  </div>
                  <Link
                    to={`/matches?reportId=${report._id}`}
                    className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {matches.map((m) => {
                    const otherItem = isLost ? m.foundReportId : m.lostReportId;
                    if (!otherItem) return null;

                    return (
                      <Link
                        key={m._id}
                        to={`/matches/${m._id}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={otherItem.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-cyan-800">
                              {otherItem.itemName}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {otherItem.location} &bull; {otherItem.category}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 pl-3">
                          <MatchScoreBadge score={m.score} size="sm" showLabel={false} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Image & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm p-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3">
                <img
                  src={
                    report.imageUrl ||
                    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={report.itemName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-3">
                {!isLost && !isReturned && (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Claim This Found Item
                  </button>
                )}

                {isLost && (
                  <Link
                    to={`/matches?reportId=${report._id}`}
                    className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-cyan-900 bg-cyan-100 hover:bg-cyan-200 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    Inspect Potential Matches
                  </Link>
                )}

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Campus Verification Shield</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Personal contact details are never shared until claim verification is approved
                    by campus authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal instance */}
      <ClaimModal
        item={report}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => {
          fetchReport();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Item Report?"
        message="Are you sure you want to delete this report? Any generated smart matches will also be cleared."
        confirmText="Yes, Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ItemDetailPage;
