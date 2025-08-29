# 🎨 Guide des Variables CSS Personnalisées - Pétanque Club

Ce guide explique comment utiliser le système de variables CSS personnalisées créé pour le site Pétanque Club avec Tailwind CSS v4.

## 🚀 Configuration Tailwind v4

Dans Tailwind CSS v4, la configuration se fait directement dans le fichier CSS avec la directive `@theme` :

```css
@import "tailwindcss";

@theme {
  --color-primary: #325118;
  --color-secondary: #C05111;
  --color-light: #FFFCEB;
  --color-dark: #191919;
  /* ... autres variables */
}
```

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Vert (Primary)**: `#325118` - Couleur principale du site
- **Orange (Secondary)**: `#C05111` - Couleur d'accent
- **Blanc Cassé (Light)**: `#FFFCEB` - Couleur de fond
- **Noir (Dark)**: `#191919` - Couleur de texte

### Variantes
- **Primary Light**: `#4a7a2a` - Version plus claire du vert
- **Primary Dark**: `#2a4210` - Version plus sombre du vert
- **Secondary Light**: `#d46a1a` - Version plus claire de l'orange
- **Secondary Dark**: `#a8430e` - Version plus sombre de l'orange
- **Light Dark**: `#f5f2d8` - Version plus sombre du blanc cassé

## 🎯 Classes CSS Personnalisées

### Boutons
```css
.btn-primary          /* Bouton vert principal */
.btn-secondary       /* Bouton orange principal */
.btn-outline-primary /* Bouton contour vert */
.btn-outline-secondary /* Bouton contour orange */
.btn-outline-light   /* Bouton contour blanc */
```

### Cartes
```css
.card                /* Carte standard */
.card-primary        /* Carte verte */
.card-secondary      /* Carte orange */
```

### Inputs
```css
.input-primary       /* Input principal */
.input-secondary     /* Input secondaire */
```

### Couleurs de fond
```css
.bg-primary          /* Fond vert */
.bg-secondary        /* Fond orange */
.bg-light            /* Fond blanc cassé */
.bg-dark             /* Fond noir */
.bg-surface          /* Fond blanc */
.bg-primary-light    /* Fond vert clair */
.bg-primary-dark     /* Fond vert sombre */
.bg-secondary-light  /* Fond orange clair */
.bg-secondary-dark   /* Fond orange sombre */
```

### Couleurs de texte
```css
.text-primary        /* Texte vert */
.text-secondary      /* Texte orange */
.text-light          /* Texte blanc cassé */
.text-dark           /* Texte noir */
```

### Couleurs avec opacité
```css
.text-primary/70     /* Texte vert 70% opaque */
.text-primary/80     /* Texte vert 80% opaque */
.text-primary/90     /* Texte vert 90% opaque */
.text-light/70       /* Texte blanc 70% opaque */
.text-light/80       /* Texte blanc 80% opaque */
.text-light/90       /* Texte blanc 90% opaque */
.text-dark/50        /* Texte noir 50% opaque */
.text-dark/70        /* Texte noir 70% opaque */
```

### Bordures
```css
.border-primary      /* Bordure verte */
.border-secondary    /* Bordure orange */
.border-light        /* Bordure blanc cassé */
.border-dark         /* Bordure noire */
.border-light-dark   /* Bordure blanc cassé sombre */
```

### Gradients
```css
.gradient-primary              /* Gradient vert */
.gradient-secondary            /* Gradient orange */
.gradient-primary-to-secondary /* Gradient vert vers orange */
```

### Ombres
```css
.shadow-primary      /* Ombre verte */
.shadow-secondary    /* Ombre orange */
```

### Transitions
```css
.transition-primary  /* Transition lente */
.transition-secondary /* Transition rapide */
```

## 📱 Utilisation dans les Composants React

### Exemple de bouton
```tsx
<button className="btn-primary">
  Trouver un terrain
</button>

<button className="btn-secondary">
  Se connecter
</button>

<button className="btn-outline-light">
  Continuer
</button>
```

### Exemple de carte
```tsx
<div className="card-primary">
  <h3 className="text-xl font-bold">Terrain Mérignac</h3>
  <p className="text-light/90">Description du terrain</p>
</div>

<div className="card">
  <h3 className="text-2xl font-bold text-primary">Carte interactive</h3>
  <p className="text-dark/70">Explorez les terrains</p>
</div>
```

### Exemple de formulaire
```tsx
<form className="space-y-6">
  <input 
    className="input-primary"
    placeholder="Nom du terrain"
  />
  
  <textarea 
    className="input-secondary"
    placeholder="Description"
  />
  
  <button className="btn-secondary">
    Ajouter le terrain
  </button>
</form>
```

### Exemple de layout
```tsx
<main className="min-h-screen bg-light">
  <header className="bg-primary text-light">
    <h1 className="text-4xl font-serif font-bold">
      LE PÉTANQUE CLUB
    </h1>
  </header>
  
  <section className="bg-light py-16">
    <div className="card">
      <h2 className="text-2xl font-bold text-primary">
        Carte interactive
      </h2>
    </div>
  </section>
  
  <footer className="bg-primary text-light">
    <p className="text-light/90">
      La communauté collaborative
    </p>
  </footer>
</main>
```

## 🎨 Exemples de Design

### Header avec navigation
```tsx
<div className="bg-primary text-light px-4 py-2 flex justify-between items-center">
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 rounded-full bg-secondary"></div>
    <span className="text-sm font-medium">Bordeaux</span>
  </div>
  <div className="text-center">
    <h1 className="text-lg font-serif font-bold">• LE PÉTANQUE CLUB •</h1>
  </div>
  <button className="text-sm hover:text-light/80 transition-colors">
    Se connecter
  </button>
</div>
```

### Section hero
```tsx
<div className="bg-primary text-light">
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="lg:w-1/2">
        <div className="relative h-96 w-full rounded-2xl overflow-hidden border-2 border-light">
          <Image src="/image.jpg" alt="Terrain" fill className="object-cover" />
        </div>
      </div>
      
      <div className="lg:w-1/2 text-center lg:text-left">
        <h1 className="text-4xl lg:text-6xl font-serif font-bold mb-6">
          Bienvenue sur le <span className="uppercase">PÉTANQUE CLUB</span>
        </h1>
        <p className="text-xl lg:text-2xl mb-8 italic text-light/90">
          "Tu tires ou tu pointes ?"
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button className="btn-secondary">Trouver un terrain</button>
          <button className="btn-outline-light">Se connecter</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Grille de terrains
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {terrains.map(terrain => (
    <article key={terrain.id} className="card-primary group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-light group-hover:text-secondary transition-colors">
          {terrain.name}
        </h3>
        <p className="mb-4 text-light/90 leading-relaxed">
          {terrain.description}
        </p>
      </div>
    </article>
  ))}
</div>
```

## 🔧 Personnalisation

Pour modifier les couleurs, éditez le fichier `src/app/globals.css` dans la section `@theme` :

```css
@theme {
  --color-primary: #325118;      /* Modifiez cette valeur */
  --color-secondary: #C05111;    /* Modifiez cette valeur */
  --color-light: #FFFCEB;        /* Modifiez cette valeur */
  --color-dark: #191919;         /* Modifiez cette valeur */
}
```

## 📚 Bonnes Pratiques

1. **Utilisez toujours les classes CSS personnalisées** au lieu de couleurs hardcodées
2. **Respectez la hiérarchie des couleurs** : primary pour les éléments principaux, secondary pour les accents
3. **Utilisez les variantes light/dark** pour créer de la profondeur
4. **Utilisez les opacités** pour créer des variations subtiles
5. **Testez sur différents écrans** pour vérifier la lisibilité

## 🎯 Avantages de cette Approche

- ✅ **Cohérence visuelle** parfaite sur tout le site
- ✅ **Maintenance simplifiée** : changez une couleur, elle s'applique partout
- ✅ **Performance optimisée** avec Tailwind CSS v4
- ✅ **Code plus lisible** avec des noms de classes explicites
- ✅ **Responsive design** intégré
- ✅ **Accessibilité** améliorée avec des contrastes optimisés

---

Ce système de variables CSS offre une cohérence visuelle parfaite et une maintenance simplifiée pour tout le site Pétanque Club, tout en respectant parfaitement la maquette fournie.
