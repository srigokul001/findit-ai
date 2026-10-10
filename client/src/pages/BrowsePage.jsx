import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  MapPin,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { reportAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
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

const CAMPUS_LOCATIONS = [
  'All',
  'Central Library',
  'Student Union',
  'Campus Cafeteria',
  'Science & Tech Complex',
  'Engineering Hall',
  'Sports Pavilion & Gym',
  'Main Auditorium',
  'North Dormitory Hall',
  'South Dormitory Hall',
  'West Parking Structure',
  'East Transit Center',
  'Bookstore & Cafe',
  'Campus Green',
];

export const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Claim modal state
  const [claimItem, setClaimItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        location: location !== 'All' ? location : undefined,
        reportType: reportType !== 'ALL' ? reportType : undefined,
        status: status !== 'ALL' ? status : undefined,
        sort,
        page,
        limit: 12,
      };

      const res = await reportAPI.getReports(params);
      if (res.data.success) {
        setItems(res.data.reports || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch browse reports:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, location, reportType, status, sort, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setReportType('ALL');
    setStatus('ALL');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="flex-1 py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Browse Campus Items
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search and filter lost &amp; found property currently registered across campus.
            </p>
          </div>

          {/* Quick Type Segmented Control */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => {
                setReportType('ALL');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                reportType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({totalCount})
            </button>
            <button
              onClick={() => {
                setReportType('LOST');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                reportType === 'LOST'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => {
                setReportType('FOUND');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                reportType === 'FOUND'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Items
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm mb-8 space-y-4">
          {/* Search bar + Sort */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keywords, brands, item names, descriptions..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-[160px]">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="date_desc">Incident Date (Recent)</option>
                  <option value="date_asc">Incident Date (Earliest)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Secondary Select Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              >
                <option value="ALL">All Statuses (Active &amp; Returned)</option>
                <option value="OPEN">Open (Unclaimed)</option>
                <option value="PENDING_CLAIM">Pending Claim</option>
                <option value="RETURNED">Returned &amp; Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Item Cards Grid */}
        {loading ? (
          <LoadingSpinner text="Searching item reports..." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No Items Match Your Filters"
            description="We couldn't find any lost or found items matching your criteria. Try loosening your keywords or reset all filters."
            actionText="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  onClaimClick={(item) => setClaimItem(item)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-slate-500 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={claimItem}
        isOpen={!!claimItem}
        onClose={() => setClaimItem(null)}
        onSuccess={() => {
          setClaimItem(null);
          fetchItems();
        }}
      />
    </div>
  );
};

export default BrowsePage;
