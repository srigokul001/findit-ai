import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Upload,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { reportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

const CAMPUS_LOCATIONS = [
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
  'Other / Off-Campus Zone',
];

const CATEGORIES = [
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

export const ReportLostPage = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    brand: '',
    color: '',
    description: '',
    reportDate: new Date().toISOString().split('T')[0],
    location: 'Central Library',
    specificLocation: '',
    identifyingDetails: '',
    contactPreference: 'in-app',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Image must be under 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.category || !formData.description || !formData.location) {
      toast.warning('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await reportAPI.createLost(data);

      if (res.data.success) {
        const matchesFound = res.data.matchCount || 0;
        toast.success(
          `Lost report logged! ${
            matchesFound > 0
              ? `We already detected ${matchesFound} potential matches!`
              : 'Our matching engine will notify you when a match is found.'
          }`
        );

        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }

        navigate(`/reports/${res.data.report._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-10 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            Lost Item Registration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Lost Item
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provide details below. FindIt AI will immediately cross-reference your report against all
            found items on campus.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="e.g. Apple iPhone 14 Pro, Blue Backpack, Dorm Keys"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Apple, Fossil, The North Face, Casio, Sony"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Space Black, Navy Blue, Silver, White, Teal"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Specific Location Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Room / Area / Seat Details
            </label>
            <input
              type="text"
              value={formData.specificLocation}
              onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
              placeholder="e.g. 2nd Floor silent study carrel 14 near window, Table 3 in dining hall"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe physical appearance, case type, visible marks, stickers, wear and tear, or contents..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Photo Upload (Optional but Recommended)
            </label>
            {imagePreview ? (
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-cyan-400 rounded-2xl cursor-pointer bg-slate-50 hover:bg-cyan-50/30 transition">
                <Upload className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">Click to upload image</span>
                <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Private Verification Details Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600" />
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Private Identifying Details (Protected)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              These details will <strong>NEVER</strong> be displayed publicly. They are stored securely
              so that when a found item matches, campus staff can verify your identity.
            </p>
            <textarea
              rows={2}
              value={formData.identifyingDetails}
              onChange={(e) => setFormData({ ...formData, identifyingDetails: e.target.value })}
              placeholder="e.g. Serial number, secret engraving, wallpaper photo, student ID number inside wallet..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Preference
            </label>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pref"
                  checked={formData.contactPreference === 'in-app'}
                  onChange={() => setFormData({ ...formData, contactPreference: 'in-app' })}
                />
                In-App Dashboard Notifications
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pref"
                  checked={formData.contactPreference === 'email'}
                  onChange={() => setFormData({ ...formData, contactPreference: 'email' })}
                />
                Email Alert
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/10 transition disabled:opacity-50"
            >
              {submitting ? (
                <>Submitting &amp; Matching...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Submit Report &amp; Check Matches
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLostPage;
