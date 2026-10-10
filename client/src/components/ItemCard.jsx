import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck, ArrowRight, Eye, CheckCircle } from 'lucide-react';

const CATEGORY_FALLBACKS = {
  Electronics: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=80',
  'ID Cards': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
  Wallets: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80',
  Bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
  Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80',
  Books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
  Accessories: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
  Clothing: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
  Other: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=80',
};

export const ItemCard = ({ item, onClaimClick }) => {
  if (!item) return null;

  const isLost = item.reportType === 'LOST';
  const isReturned = item.status === 'RETURNED';
  const isPendingClaim = item.status === 'PENDING_CLAIM';

  const imageUrl = item.imageUrl || CATEGORY_FALLBACKS[item.category] || CATEGORY_FALLBACKS.Other;

  const formattedDate = new Date(item.reportDate || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-cyan-300/80 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = CATEGORY_FALLBACKS[item.category] || CATEGORY_FALLBACKS.Other;
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isReturned ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Returned
            </span>
          ) : isPendingClaim ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
              Claim Pending
            </span>
          ) : isLost ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-sm">
              Lost
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-cyan-600 text-white shadow-sm">
              Found
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-md text-slate-800 shadow-xs flex items-center gap-1">
            <Tag className="w-3 h-3 text-cyan-600" />
            {item.category}
          </span>
        </div>

        {/* Location pill on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
          <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-cyan-700 transition line-clamp-1">
              {item.itemName}
            </h3>
          </div>

          {/* Sub details: brand & color */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-slate-500">
            {item.brand && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                {item.brand}
              </span>
            )}
            {item.color && (
              <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                <span
                  className="w-2 h-2 rounded-full border border-slate-300"
                  style={{
                    backgroundColor:
                      item.color.toLowerCase() === 'white'
                        ? '#ffffff'
                        : item.color.toLowerCase() === 'space black' || item.color.toLowerCase() === 'black'
                        ? '#000000'
                        : item.color.toLowerCase() === 'navy blue' || item.color.toLowerCase() === 'navy'
                        ? '#000080'
                        : item.color.toLowerCase() === 'teal'
                        ? '#008080'
                        : item.color.toLowerCase() === 'brown'
                        ? '#8b4513'
                        : '#94a3b8',
                  }}
                />
                {item.color}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/reports/${item._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </Link>

          {!isLost && !isReturned && onClaimClick && (
            <button
              onClick={() => onClaimClick(item)}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-sm hover:shadow transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Claim
            </button>
          )}

          {isLost && (
            <Link
              to={`/matches?reportId=${item._id}`}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition"
              title="View matches for this lost item"
            >
              Matches
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
