'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useLogin()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-xl text-primary">Chargement...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null 
  }

  return (
    <div className="min-h-screen bg-light relative overflow-hidden">
      <header className="bg-primary text-light px-4 py-3 flex justify-between items-center" role="banner">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-secondary" aria-hidden="true"></div>
          <span className="text-sm font-medium">Bordeaux</span>
        </div>
        <div className="w-3 h-3 rounded-full bg-secondary opacity-0 sm:opacity-100" aria-hidden="true"></div>
       
      </header>

      <main className="bg-primary min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <figure className="order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-3xl transform translate-x-2 translate-y-2" aria-hidden="true"></div>
                <div className="relative h-80 sm:h-96 lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/login_image.jpg"
                    alt="Terrain de pétanque avec boules en métal sur un sol en gravier, représentant l'ambiance conviviale du jeu"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
              </div>
            </figure>

            <section className="order-1 lg:order-2 text-center lg:text-left">
              <div className="space-y-6">
                <header>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-light mb-4">
                    Bienvenue sur le <span className="uppercase text-secondary">PÉTANQUE CLUB</span>
                  </h1>
                  <p className="text-xl sm:text-2xl italic text-light/90 mb-6">
                    &quot;Tu tires ou tu pointes ?&quot;
                  </p>
                </header>

                <p className="text-lg text-light/80 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  L&apos;application collaborative de la pétanque ! Découvrez et partagez les meilleurs terrains de pétanque près de chez vous.
                </p>

                <nav className="flex flex-col sm:flex-row gap-4 pt-4" aria-label="Options de connexion">
                  <button 
                    onClick={() => signIn('google')}
                    className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl flex items-center justify-center cursor-pointer"
                    aria-label="Se connecter avec un compte Google pour accéder à toutes les fonctionnalités"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Se connecter avec Google
                  </button>
                  
                  <button 
                    onClick={() => signIn('guest')}
                    className="bg-transparent border-2 border-light text-light px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center cursor-pointer hover:bg-secondary hover:text-white transition-all duration-300"
                    aria-label="Explorer les terrains en mode invité (consultation uniquement)"
                  >
                    <svg className="w-6 h-6 mr-3 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Explorer les terrains
                  </button>
                </nav>
              </div>
            </section>
          </div>
        </div>
      </main>

      <section className="bg-gradient-to-br from-light to-light-dark py-20" aria-labelledby="features-title">
        <div className="max-w-6xl mx-auto px-4">
          <header className="text-center mb-16">
            <h2 id="features-title" className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-6">
              Rejoignez la <span className="text-secondary">communauté</span>
            </h2>
            <p className="text-xl text-dark/70 max-w-3xl mx-auto leading-relaxed">
              Découvrez les meilleurs terrains de pétanque près de chez vous et partagez vos trouvailles avec la communauté.
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list" aria-label="Fonctionnalités de l'application">
            <article className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-light-dark overflow-hidden" role="listitem">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" aria-hidden="true"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-3">Découvrez</h3>
                <p className="text-dark/60 leading-relaxed">Trouvez les terrains près de chez vous grâce à notre carte interactive</p>
              </div>
            </article>
            
            <article className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-light-dark overflow-hidden" role="listitem">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary" aria-hidden="true"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-3">Partagez</h3>
                <p className="text-dark/60 leading-relaxed">Ajoutez vos terrains favoris et enrichissez la base de données</p>
              </div>
            </article>
            
            <article className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-light-dark overflow-hidden" role="listitem">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" aria-hidden="true"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-dark mb-3">Évaluez</h3>
                <p className="text-dark/60 leading-relaxed">Notez les terrains que vous visitez pour aider la communauté</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-light py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xl font-bold mb-4 uppercase">Terrains de Pétanque</h3>
              <p className="text-light/90 leading-relaxed">
                La communauté collaborative pour découvrir et partager les meilleurs terrains de pétanque.
              </p>
            </section>
            
            <section>
              <h4 className="text-lg font-semibold mb-4 uppercase">À propos</h4>
              <ul className="space-y-2 text-light/90" role="list">
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Qui sommes-nous ?
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Contact
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Mentions légales
                </li>
              </ul>
            </section>
          </div>
        </div>
      </footer>
    </div>
  )
} 