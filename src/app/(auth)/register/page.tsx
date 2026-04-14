'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Password tidak cocok',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Email sudah terdaftar. Silakan login.')
      } else {
        setError('Terjadi kesalahan. Coba lagi.')
      }
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-2 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-brand-black">Cek email kamu!</h2>
          <p className="text-brand-muted text-sm mt-2">
            Kami kirim link verifikasi ke emailmu. Klik link tersebut untuk mengaktifkan akun, lalu login.
          </p>
          <p className="text-xs text-brand-muted mt-4">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-2 p-8">
          <div className="mb-8 text-center">
            <Link href="/">
              <span className="text-brand-black font-extrabold text-2xl">
                ayo<span className="text-brand-yellow">masukptn</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold mt-4 text-brand-black">Buat akun baru</h1>
            <p className="text-sm text-brand-muted mt-1">Sudah daftar? Akun dibuat otomatis saat checkout</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap kamu"
              register={register('full_name')}
              error={errors.full_name?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@kamu.com"
              register={register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              register={register('password')}
              error={errors.password?.message}
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              register={register('confirm')}
              error={errors.confirm?.message}
            />

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              Buat Akun
            </Button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-brand-black hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
