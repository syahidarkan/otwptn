'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Star, Award, ArrowRight, ArrowLeft } from 'lucide-react'
import type { MenteeTestimonial } from '@/data/testimonials'

interface MenteeCardProps {
  item: MenteeTestimonial
  className?: string
}

export default function MenteeTestimonialCard({ item, className = '' }: MenteeCardProps) {
  const isTop = item.isTopMentee
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = item.quote.length > 220

  return (
    <div
      className={`flex-shrink-0 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ease-out relative select-none ${
        isExpanded
          ? 'w-[480px] sm:w-[600px] z-30'
          : 'w-80'
      } ${
        isTop
          ? 'bg-white border-2 border-[#ffd400] shadow-[0_4px_28px_rgba(255,212,0,0.32)] ring-2 ring-[#ffd400]/30 hover:shadow-[0_8px_36px_rgba(255,212,0,0.45)]'
          : 'bg-white/90 backdrop-blur-md border border-gray-200/90 shadow-sm hover:shadow-md hover:border-gray-300'
      } ${className}`}
    >
      {/* Top Mentee Badge */}
      {isTop && (
        <div className="absolute -top-3.5 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd400] text-gray-950 text-[10.5px] font-black uppercase tracking-wider shadow-md">
          <Award className="w-3.5 h-3.5 text-gray-950" />
          <span>TOP MENTEE</span>
        </div>
      )}

      {/* Header: Rating & Jalur */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[#ffd400] text-[#ffd400]"
              />
            ))}
          </div>
          <span
            className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
              isTop
                ? 'bg-amber-100 text-amber-950 border border-amber-300/80'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {item.jalur}
          </span>
        </div>

        {/* Testimonial Quote */}
        <p
          className={`text-xs sm:text-[13px] leading-relaxed text-gray-700 font-normal ${
            isExpanded ? '' : 'line-clamp-4'
          }`}
        >
          &ldquo;{item.quote}&rdquo;
        </p>

        {/* Horizontal Expand / Collapse Action */}
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer group"
          >
            {isExpanded ? (
              <>
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                <span>Perkecil kartu</span>
              </>
            ) : (
              <>
                <span>Baca selengkapnya (perpanjang ke samping)</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer: Photo, Name, Univ & Prodi */}
      <div className="pt-3.5 mt-3 border-t border-gray-100/90 flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-amber-50 border border-gray-200 shadow-2xs">
          <Image
            src={item.photo}
            alt={item.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-gray-950 truncate">
            {item.name}
          </p>
          <p className="text-[11px] font-semibold text-amber-600 truncate">
            {item.univ}
          </p>
          <p className="text-[10px] text-gray-500 font-medium truncate">
            {item.prodi}
          </p>
        </div>
      </div>
    </div>
  )
}
