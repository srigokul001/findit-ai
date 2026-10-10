import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  FileQuestion,
  PackageCheck,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  AlertTriangle,
  RotateCcw,
  Eye,
  Trash2,
  Check,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';
import { adminAPI, claimAPI, reportAPI, matchAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import confetti from 'canvas-confetti';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('claims');
  const [statsData, setStatsData] = useState(null);
  const [claims, setClaims] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Claim Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Recalculating matches
  const [recalculating, setRecalculating] = useState(false);

  // Delete report
  const [deleteReportId, setDeleteReportId] = useState(null);
  const [deletingReport, setDeletingReport] = useState(false);

  const toast = useToast();

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, claimsRes, reportsRes, usersRes] = await Promise.allSettled([
        adminAPI.getStats(),
        claimAPI.getClaims({ status: 'ALL' }),
        reportAPI.getReports({ limit: 50 }),
        adminAPI.getUsers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStatsData(statsRes.value.data);
      }
      if (claimsRes.status === 'fulfilled' && claimsRes.value.data.success) {
        setClaims(claimsRes.value.data.claims || []);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value.data.success) {
        setAllReports(reportsRes.value.data.reports || []);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        setUsers(usersRes.value.data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load administrative overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewClaim = async (claimId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await claimAPI.reviewClaim(claimId, {
        status: newStatus,
        adminNotes,
      });

      if (res.data.success) {
        toast.success(`Claim status updated to ${newStatus}`);
        if (newStatus === 'COMPLETED') {
          try {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          } catch (e) {
            // ignore
          }
        }
        setSelectedClaim(null);
        setAdminNotes('');
        loadAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review claim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculateMatches = async () => {
    try {
      setRecalculating(true);
      const res = await matchAPI.recalculate();
      if (res.data.success) {
        toast.success(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      toast.error('Failed to trigger recalculation');
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleSuspicious = async (reportId) => {
    try {
      const res = await adminAPI.toggleSuspicious(reportId);
      if (res.data.success) {
        toast.success(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      toast.error('Failed to toggle flag');
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    try {
      setDeletingReport(true);
      await reportAPI.deleteReport(deleteReportId);
      toast.success('Report removed by administrator');
      setDeleteReportId(null);
      loadAdminData();
    } catch (err) {
      toast.error('Failed to delete report');
    } finally {
      setDeletingReport(false);
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const res = await adminAPI.updateUserRole(userId, nextRole);
      if (res.data.success) {
        toast.success(`User role changed to ${nextRole}`);
        loadAdminData();
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const stats = statsData?.stats || {};
  const categoryBreakdown = statsData?.categoryBreakdown || [];
  const locationBreakdown = statsData?.locationBreakdown || [];

  return (
    <div className="flex-1 py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Administrative Governance Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Lost &amp; Found Oversight
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify claims, inspect private proof details, evaluate suspicious reports, and govern users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculateMatches}
              disabled={recalculating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Evaluating...' : 'Recalculate All Matches'}
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Users
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalUsers || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Lost Reports
            </span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{stats.totalLost || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Found Reports
            </span>
            <div className="text-2xl font-extrabold text-cyan-600 mt-1">{stats.totalFound || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Calculated Matches
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.totalMatches || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Claims
            </span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.pendingClaims || 0}</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Returned &amp; Closed
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.returnedItems || 0} ({stats.recoveryRate || 0}%)
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Claim Verification Queue ({claims.filter((c) => c.status === 'PENDING').length} Pending)
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Manage Reports ({allReports.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Campus Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Distribution Analytics
          </button>
        </div>

        {/* Tab Content Panels */}
        {loading ? (
          <LoadingSpinner text="Fetching admin records..." />
        ) : (
          <div>
            {/* 1. CLAIMS REVIEW QUEUE */}
            {activeTab === 'claims' && (
              <div className="space-y-4">
                {claims.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                    <p className="text-sm font-semibold text-slate-600">No ownership claims submitted.</p>
                  </div>
                ) : (
                  claims.map((claim) => {
                    const item = claim.itemReportId;
                    const claimant = claim.claimantId;

                    return (
                      <div
                        key={claim._id}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold">
                              Claimant: <strong className="text-slate-800">{claimant?.name || 'Student'}</strong> ({claimant?.email})
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                              Claiming: &quot;{item ? item.itemName : 'Reported Item'}&quot;
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                claim.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : claim.status === 'APPROVED'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : claim.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {claim.status}
                            </span>
                          </div>
                        </div>

                        {/* Private Proof Box (Admin Visible) */}
                        <div className="my-4 p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                            <Lock className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Confidential Ownership Proof (Claimant Entry):</span>
                          </div>
                          <p className="text-cyan-950 font-mono text-[11px] bg-white p-3 rounded-xl border border-cyan-200/80 leading-relaxed">
                            {claim.privateVerificationDetails}
                          </p>
                          {claim.claimReason && (
                            <p className="text-slate-600 text-xs">
                              <strong className="text-slate-800">Circumstances: </strong>
                              {claim.claimReason}
                            </p>
                          )}
                          <div className="text-[11px] text-slate-500 pt-1">
                            Contact: Phone {claim.contactInfo?.phone || claimant?.phone || 'N/A'} &bull; Email{' '}
                            {claim.contactInfo?.email || claimant?.email}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">
                            Current Item Custody: <strong className="text-slate-800">{item?.storageLocation || 'With Finder'}</strong>
                          </div>

                          <div className="flex items-center gap-2">
                            {claim.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleReviewClaim(claim._id, 'APPROVED')}
                                  disabled={actionLoading}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve Verification
                                </button>
                                <button
                                  onClick={() => handleReviewClaim(claim._id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                                >
                                  Reject Claim
                                </button>
                              </>
                            )}

                            {claim.status === 'APPROVED' && (
                              <button
                                onClick={() => handleReviewClaim(claim._id, 'COMPLETED')}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm Handover &amp; Mark Item Returned
                              </button>
                            )}

                            {claim.status === 'COMPLETED' && (
                              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Handover finalized
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 2. MANAGE ALL REPORTS */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Reporter</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allReports.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              {r.isSuspicious && (
                                <span className="p-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  SUSPICIOUS
                                </span>
                              )}
                              <span>{r.itemName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                r.reportType === 'LOST'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-cyan-100 text-cyan-700'
                              }`}
                            >
                              {r.reportType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{r.category}</td>
                          <td className="py-3 px-4 text-slate-600">{r.location}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {r.reporterId?.name || 'Anonymous'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">{r.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <Link
                              to={`/reports/${r._id}`}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleToggleSuspicious(r._id)}
                              className={`px-2 py-1 rounded-lg font-semibold transition ${
                                r.isSuspicious
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Flag/Unflag suspicious"
                            >
                              {r.isSuspicious ? 'Flagged' : 'Flag'}
                            </button>
                            <button
                              onClick={() => setDeleteReportId(r._id)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. MANAGE USERS */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Campus ID</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4 text-right">Role Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{u.campusId || '—'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleUserRole(u._id, u.role)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                              Toggle to {u.role === 'admin' ? 'Student' : 'Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. ANALYTICS & STATS BREAKDOWN */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category breakdown */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                  <h3 className="font-extrabold text-sm text-slate-900 mb-4">
                    Item Category Volume
                  </h3>
                  <div className="space-y-3 text-xs">
                    {categoryBreakdown.map((cat) => {
                      const maxVal = Math.max(...categoryBreakdown.map((c) => c.count), 1);
                      const pct = Math.round((cat.count / maxVal) * 100);

                      return (
                        <div key={cat.category}>
                          <div className="flex justify-between font-semibold mb-1">
                            <span className="text-slate-700">{cat.category}</span>
                            <span className="text-cyan-700 font-bold">{cat.count} reports</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-cyan-500 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location breakdown */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                  <h3 className="font-extrabold text-sm text-slate-900 mb-4">
                    Top Campus Loss / Found Locations
                  </h3>
                  <div className="space-y-3 text-xs">
                    {locationBreakdown.map((loc) => {
                      const maxVal = Math.max(...locationBreakdown.map((l) => l.count), 1);
                      const pct = Math.round((loc.count / maxVal) * 100);

                      return (
                        <div key={loc.location}>
                          <div className="flex justify-between font-semibold mb-1">
                            <span className="text-slate-700">{loc.location}</span>
                            <span className="text-slate-900 font-bold">{loc.count} incidents</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-slate-800 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Report Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteReportId}
        title="Admin Report Removal"
        message="Are you sure you want to remove this item report from the database?"
        confirmText="Yes, Delete"
        confirmVariant="danger"
        loading={deletingReport}
        onConfirm={handleDeleteReport}
        onCancel={() => setDeleteReportId(null)}
      />
    </div>
  );
};

export default AdminPage;
