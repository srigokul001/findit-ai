import React, { useState } from 'react';
import { X, ShieldAlert, Lock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { claimAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const ClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    privateVerificationDetails: '',
    claimReason: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
  });

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.privateVerificationDetails.trim()) {
      toast.warning('Please provide private verification details to prove ownership.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await claimAPI.createClaim({
        itemReportId: item._id,
        privateVerificationDetails: formData.privateVerificationDetails,
        claimReason: formData.claimReason,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
      });

      if (res.data.success) {
        toast.success('Ownership claim submitted! Our team will verify your proof details.');
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
        if (onSuccess) onSuccess(res.data.claim);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-navy-900 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">Claim Ownership</h3>
              <p className="text-xs text-slate-300 mt-1">Item: {item.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Privacy Security Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-950 flex items-start gap-3">
            <Lock className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-semibold block text-cyan-900">End-to-End Privacy Guard:</strong>
              Your verification details are kept strictly confidential and will never be shown publicly. Only campus administrators and the verifier can inspect these details.
            </div>
          </div>

          {/* Private Verification Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Private Identifying Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.privateVerificationDetails}
              onChange={(e) =>
                setFormData({ ...formData, privateVerificationDetails: e.target.value })
              }
              placeholder="e.g. Serial number, passcode hint, screen wallpaper image description, engraved initials, inside stickers, specific contents or denominations..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition resize-none placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provide unique details that only the true owner would know.
            </p>
          </div>

          {/* Claim circumstances */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Circumstances / Where &amp; When Lost
            </label>
            <textarea
              rows={2}
              value={formData.claimReason}
              onChange={(e) => setFormData({ ...formData, claimReason: e.target.value })}
              placeholder="e.g. I left it on table 18 in library 2nd floor while studying around 2 PM..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="student@campus.edu"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Claim for Verification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
