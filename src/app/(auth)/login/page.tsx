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
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      setError('Email atau password salah. Coba lagi.')
      return
    }

    // Check role for redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'member') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-2 p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/">
              <span className="text-brand-black font-extrabold text-2xl">
                otw<span className="text-brand-yellow">ptn</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold mt-4 text-brand-black">Masuk ke akun</h1>
            <p className="text-sm text-brand-muted mt-1">Akses dashboard dan materi bimbinganmu</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              register={register('password')}
              error={errors.password?.message}
            />

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              Masuk
            </Button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Belum punya akun?{' '}
            <Link href="/daftar" className="font-semibold text-brand-black hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
