'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQS } from '@/lib/constants'

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl font-extrabold text-brand-black">Pertanyaan Umum</h2>
        </div>

        <div className="flex flex-col divide-y divide-brand-gray-2 border border-brand-gray-2 rounded-2xl overflow-hidden">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-brand-gray transition-colors"
              >
                <span className="font-semibold text-brand-black">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={cn('shrink-0 text-brand-muted transition-transform', open === i && 'rotate-180')}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-brand-muted text-sm leading-relaxed bg-brand-gray/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
