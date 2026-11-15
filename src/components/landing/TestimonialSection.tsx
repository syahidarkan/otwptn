'use client'

import React from 'react'
import { motion } from 'framer-motion'
import MenteeTestimonialCard from '@/components/ui/MenteeTestimonialCard'
import { REAL_TOP_MENTEES, DUMMY_MENTEES } from '@/data/testimonials'

export default function TestimonialSection() {
  // Row 1 starts with our verified Top Mentees, followed by student community reviews
  const row1 = [...REAL_TOP_MENTEES, ...DUMMY_MENTEES.slice(0, 4)]
  const row2 = [...REAL_TOP_MENTEES.slice().reverse(), ...DUMMY_MENTEES.slice(4)]

  // Duplicate for seamless infinite marquee loop
  const marqueeRow1 = [...row1, ...row1]
  const marqueeRow2 = [...row2, ...row2]

  return (
    <section id="testimoni" className="py-20 overflow-hidden bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 text-amber-950 border border-amber-300/80 text-xs font-bold mb-3">
          ✨ Bukti Nyata Kelulusan Mentee
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight"
        >
          Dengar Langsung dari Camaba yang{' '}
          <span className="text-amber-600 underline decoration-[#ffd400] decoration-wavy decoration-2">
            Udah Lolos Kampus Impian!
          </span>
        </motion.h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-xl mx-auto mt-3">
          Dari bedah esai PPKB UI, beasiswa prestasi ADik, sampai rasionalisasi rapor SNBP. Inilah cerita jujur perjuangan mereka bersama mentor OTWPTN.
        </p>
      </div>

      {/* Row 1 Marquee (Left to Right) */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-r from-[#fafafa] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-l from-[#fafafa] to-transparent" />
        <div className="animate-marquee flex gap-5 py-3" style={{ width: 'max-content' }}>
          {marqueeRow1.map((item, i) => (
            <MenteeTestimonialCard key={`r1-${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2 Marquee (Right to Left) */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-r from-[#fafafa] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 z-10 pointer-events-none bg-gradient-to-l from-[#fafafa] to-transparent" />
        <div className="animate-marquee-reverse flex gap-5 py-3" style={{ width: 'max-content' }}>
          {marqueeRow2.map((item, i) => (
            <MenteeTestimonialCard key={`r2-${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
