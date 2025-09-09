'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-xl text-primary">Chargement...</div>
      </div>
    )
  }

  if (session) {
    return null 
  }

  return (
    <div className="min-h-screen bg-light relative overflow-hidden">
      <header className="bg-primary text-light px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          <span className="text-sm font-medium">Bordeaux</span>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-lg font-serif font-bold">• LE PÉTANQUE CLUB •</h1>
        </div>
        <div className="w-3 h-3 rounded-full bg-secondary opacity-0 sm:opacity-100"></div>
      </header>

      <div className="bg-primary min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 sm:gap-12">
          <div className="w-full">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden border-2 border-light">
              <Image
                src="/ball_player.svg"
                alt="Joueur de pétanque"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6 text-light">
              Bienvenue sur le <span className="uppercase">PÉTANQUE CLUB</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 italic text-light/90">
              &quot;Tu tires ou tu pointes ?&quot;
            </p>
            <p className="text-base sm:text-lg text-light/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              L&apos;application collaborative de la pétanque ! Découvrez et partagez les meilleurs terrains de pétanque près de chez vous. Créez un compte pour ajouter de nouveaux terrains.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary block">12</span>
                <span className="text-base sm:text-lg text-light/90">Terrains référencés</span>
              </div>
              <div className="text-center">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary block">4.8</span>
                <span className="text-base sm:text-lg text-light/90">Note moyenne</span>
              </div>
              <div className="text-center">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary block">250+</span>
                <span className="text-base sm:text-lg text-light/90">Joueurs inscrits</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/')}
                className="btn-secondary w-full sm:w-auto"
              >
                Voir les terrains
              </button>
              <button 
                onClick={() => signIn('google')}
                className="btn-outline-light w-full sm:w-auto"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-light py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-surface rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-light-dark">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-2">
                Terrains de Pétanque
              </h2>
              <p className="text-lg italic text-secondary mb-4">
                &quot;Tu tires ou tu pointes ?&quot;
              </p>
              <p className="text-sm text-dark/70">
                Connectez-vous pour découvrir et partager les meilleurs terrains de pétanque
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => signIn('google')}
                className="w-full flex justify-center items-center px-6 py-4 border-2 border-light-dark rounded-xl shadow-sm text-sm font-medium text-dark bg-surface hover:bg-light-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-light-dark" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface text-dark/50">ou</span>
                </div>
              </div>

              <button
                onClick={() => signIn('guest')}
                className="btn-secondary w-full flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Continuer en tant qu&apos;invité
              </button>
            </div>

            <div className="text-center mt-6">
              <div className="bg-light border border-light-dark rounded-xl p-4">
                <p className="text-xs text-primary">
                  <span className="font-semibold">Mode invité :</span> Consultez tous les terrains mais sans pouvoir en ajouter de nouveaux
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-light py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase">Terrains de Pétanque</h3>
              <p className="text-light/90 leading-relaxed">
                La communauté collaborative pour découvrir et partager les meilleurs terrains de pétanque.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 uppercase">À propos</h4>
              <ul className="space-y-2 text-light/90">
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Qui sommes-nous ?
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Contact
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Mentions légales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 