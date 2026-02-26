'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useLogin } from '../hooks/useLogin'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useLogin()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)

  const handleGuestLogin = async () => {
    setSigningIn(true)
    const result = await signIn('guest', { redirect: false })
    if (result?.ok) {
      router.replace('/')
    }
    setSigningIn(false)
  }

  if (isLoading || signingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: image */}
            <div className="hidden lg:block">
              <div className="relative h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/login_image.jpg"
                  alt="Terrain de petanque"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-primary-light border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-accent border-2 border-white" />
                    </div>
                    <p className="text-white/90 text-sm">Rejoignez la communaute</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs text-white/80 font-medium">Bordeaux & alentours</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                Petanque<br />
                <span className="text-secondary">Club</span>
              </h1>

              <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
                Decouvrez et partagez les meilleurs terrains de petanque pres de chez vous. Notez, commentez, explorez.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="bg-white text-dark px-6 py-3.5 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-3 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <button
                  onClick={handleGuestLogin}
                  className="border border-white/25 text-white px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Explorer en invite
                </button>
              </div>

              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start text-white/40 text-xs">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Carte interactive
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Notes & avis
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Communaute
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-white/30 text-xs">
        &copy; 2025 Petanque Club
      </footer>
    </div>
  )
}
