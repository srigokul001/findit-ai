import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  FileQuestion,
  PackageCheck,
  Sparkles,
  ShieldAlert,
  Bell,
  PlusCircle,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Tag,
  MapPin,
  Calendar,
} from 'lucide-react';
import { reportAPI, matchAPI, claimAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'lost';

  const { user } = useAuth();
  const toast = useToast();

  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsRes, matchesRes, claimsRes, notifRes] = await Promise.allSettled([
        reportAPI.getMyReports(),
        matchAPI.getMatches({ myMatches: 'true' }),
        claimAPI.getMyClaims(),
        notificationAPI.getNotifications(),
      ]);

      if (reportsRes.status === 'fulfilled' && reportsRes.value.data.success) {
        setLostReports(reportsRes.value.data.lost || []);
        setFoundReports(reportsRes.value.data.found || []);
      }

      if (matchesRes.status === 'fulfilled' && matchesRes.value.data.success) {
        setMatches(matchesRes.value.data.matches || []);
      }

      if (claimsRes.status === 'fulfilled' && claimsRes.value.data.success) {
        setClaims(claimsRes.value.data.claims || []);
      }

      if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
        setNotifications(notifRes.value.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteReport = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await reportAPI.deleteReport(deleteId);
      toast.success('Report deleted successfully');
      setDeleteId(null);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  const markNotifRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="flex-1 py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-extrabold text-xl text-cyan-400">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.email} &bull; ID: {user?.campusId || 'STU-VERIFIED'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Report Found Item
            </Link>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setTab('lost')}
            className={`p-4 rounded-2xl border text-left transition ${
              currentTab === 'lost'
                ? 'bg-rose-50 border-rose-200 shadow-sm'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                My Lost Items
              </span>
              <FileQuestion className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{lostReports.length}</div>
          </button>

          <button
            onClick={() => setTab('found')}
            className={`p-4 rounded-2xl border text-left transition ${
              currentTab === 'found'
                ? 'bg-cyan-50 border-cyan-200 shadow-sm'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                My Found Items
              </span>
              <PackageCheck className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{foundReports.length}</div>
          </button>

          <button
            onClick={() => setTab('matches')}
            className={`p-4 rounded-2xl border text-left transition ${
              currentTab === 'matches'
                ? 'bg-amber-50 border-amber-200 shadow-sm'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Smart Matches
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{matches.length}</div>
          </button>

          <button
            onClick={() => setTab('claims')}
            className={`p-4 rounded-2xl border text-left transition ${
              currentTab === 'claims'
                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                My Claims
              </span>
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{claims.length}</div>
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex border-b border-slate-200 mb-6 space-x-1 sm:space-x-4 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setTab('lost')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'lost'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            Lost Reports ({lostReports.length})
          </button>

          <button
            onClick={() => setTab('found')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'found'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Found Reports ({foundReports.length})
          </button>

          <button
            onClick={() => setTab('matches')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'matches'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            My Matches ({matches.length})
          </button>

          <button
            onClick={() => setTab('claims')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'claims'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            My Claims ({claims.length})
          </button>

          <button
            onClick={() => setTab('notifications')}
            className={`pb-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'notifications'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* Tab Content Panels */}
        {loading ? (
          <LoadingSpinner text="Refreshing your dashboard items..." />
        ) : (
          <div>
            {/* 1. LOST REPORTS TAB */}
            {currentTab === 'lost' && (
              <div>
                {lostReports.length === 0 ? (
                  <EmptyState
                    icon={FileQuestion}
                    title="No Lost Items Logged"
                    description="You haven't reported any lost items yet. Submit a report to have FindIt AI automatically cross-reference found items."
                    actionText="Report a Lost Item"
                    actionLink="/report/lost"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lostReports.map((report) => (
                      <div
                        key={report._id}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                              {report.status}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(report.reportDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={report.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200'}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                {report.itemName}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-cyan-600" />
                                {report.location}
                              </p>
                              <p className="text-[11px] text-cyan-600 font-medium mt-0.5">
                                Category: {report.category}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {report.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to={`/reports/${report._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-cyan-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </Link>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/matches?reportId=${report._id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition"
                            >
                              Check Matches
                            </Link>
                            <button
                              onClick={() => setDeleteId(report._id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              title="Delete report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. FOUND REPORTS TAB */}
            {currentTab === 'found' && (
              <div>
                {foundReports.length === 0 ? (
                  <EmptyState
                    icon={PackageCheck}
                    title="No Found Items Logged"
                    description="You haven't reported any found items yet. If you picked up an item on campus, report it to find the owner."
                    actionText="Report a Found Item"
                    actionLink="/report/found"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foundReports.map((report) => (
                      <div
                        key={report._id}
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800">
                              {report.status}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(report.reportDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={report.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200'}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                {report.itemName}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-cyan-600" />
                                {report.location}
                              </p>
                              <p className="text-[11px] text-cyan-600 font-medium mt-0.5">
                                Storage: {report.storageLocation}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {report.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to={`/reports/${report._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-cyan-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </Link>

                          <button
                            onClick={() => setDeleteId(report._id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Delete report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. SMART MATCHES TAB */}
            {currentTab === 'matches' && (
              <div>
                {matches.length === 0 ? (
                  <EmptyState
                    icon={Sparkles}
                    title="No Active Matches Detected Yet"
                    description="When other students report items matching your lost or found descriptions, they will appear right here with similarity scores."
                    actionText="Browse All Public Items"
                    actionLink="/browse"
                  />
                ) : (
                  <div className="space-y-4">
                    {matches.map((m) => {
                      const lost = m.lostReportId;
                      const found = m.foundReportId;
                      if (!lost || !found) return null;

                      return (
                        <div
                          key={m._id}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <MatchScoreBadge score={m.score} size="md" />
                            <div>
                              <div className="font-bold text-sm text-slate-900">
                                Match: &quot;{lost.itemName}&quot; &harr; &quot;{found.itemName}&quot;
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Locations: {lost.location} vs {found.location} &bull; Category:{' '}
                                {lost.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/matches/${m._id}`}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1"
                            >
                              Inspect Match Analysis &rarr;
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. MY CLAIMS TAB */}
            {currentTab === 'claims' && (
              <div>
                {claims.length === 0 ? (
                  <EmptyState
                    icon={ShieldAlert}
                    title="No Active Claims"
                    description="You haven't submitted any ownership claims. When you spot your lost item in the found directory, submit a claim with private verification details."
                    actionText="Browse Found Items"
                    actionLink="/browse?reportType=FOUND"
                  />
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => {
                      const item = claim.itemReportId;
                      const statusConfig = {
                        PENDING: {
                          bg: 'bg-amber-100 text-amber-800 border-amber-200',
                          icon: Clock,
                          label: 'Pending Verification Review',
                        },
                        APPROVED: {
                          bg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                          icon: CheckCircle2,
                          label: 'Claim Approved (Ready for Pickup)',
                        },
                        COMPLETED: {
                          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          icon: CheckCircle2,
                          label: 'Item Recovered & Returned',
                        },
                        REJECTED: {
                          bg: 'bg-rose-100 text-rose-800 border-rose-200',
                          icon: XCircle,
                          label: 'Verification Insufficient',
                        },
                      }[claim.status] || {
                        bg: 'bg-slate-100 text-slate-800',
                        icon: Clock,
                        label: claim.status,
                      };

                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={claim._id}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-semibold text-slate-400">Claim ID: {claim._id.slice(-6)}</span>
                              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                                {item ? item.itemName : 'Claimed Item'}
                              </h3>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 self-start sm:self-auto ${statusConfig.bg}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                              <span className="font-bold text-slate-700 block mb-1">
                                Your Private Verification Proof:
                              </span>
                              <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                                {claim.privateVerificationDetails}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                              <div>
                                <span className="font-bold text-slate-700">Submitted On: </span>
                                <span className="text-slate-600">
                                  {new Date(claim.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {item?.storageLocation && (
                                <div>
                                  <span className="font-bold text-slate-700">Storage / Pickup Spot: </span>
                                  <span className="text-cyan-700 font-semibold">{item.storageLocation}</span>
                                </div>
                              )}
                              {claim.adminNotes && (
                                <div className="pt-1 text-slate-800">
                                  <span className="font-bold">Reviewer Feedback: </span>
                                  <span className="italic">{claim.adminNotes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. NOTIFICATIONS TAB */}
            {currentTab === 'notifications' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">Your Campus Alerts</h3>
                  <span className="text-xs text-slate-500">
                    {notifications.filter((n) => !n.read).length} unread
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications on file.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`py-3.5 flex items-start justify-between gap-4 transition ${
                          n.read ? 'opacity-70' : 'bg-cyan-50/20 px-3 rounded-2xl'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {n.link && (
                            <Link
                              to={n.link}
                              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                            >
                              Go &rarr;
                            </Link>
                          )}
                          {!n.read && (
                            <button
                              onClick={() => markNotifRead(n._id)}
                              className="text-[11px] text-slate-400 hover:text-slate-600"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Report?"
        message="Are you sure you want to delete this report? Associated matches will also be cleared."
        confirmText="Yes, Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDeleteReport}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DashboardPage;
