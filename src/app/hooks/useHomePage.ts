import { useEffect, useState } from 'react';

type Terrain = {
  _id?: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  imageUrl?: string;
  rating?: {
    average: number;
    count: number;
    total: number;
  };
};

type Filters = {
  minRating: number;
  maxDistance: number;
  userLocation: { lat: number; lng: number } | null;
};

export function useHomePage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [filteredTerrains, setFilteredTerrains] = useState<Terrain[]>([]);
  const [displayedTerrains, setDisplayedTerrains] = useState<Terrain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const terrainsPerPage = 5;
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minRating: 0,
    maxDistance: 50,
    userLocation: null
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    address: '',
    image: null as File | null,
  });
  const [focusedTerrain, setFocusedTerrain] = useState<{ lat: number; lng: number } | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(terrainsPerPage);
  const [showAddTerrainModal, setShowAddTerrainModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/terrains')
      .then(res => res.json())
      .then(data => {
        setTerrains(data);
        setFilteredTerrains(data);
      });
  }, []);

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    let filtered = [...terrains];

    if (filters.minRating > 0) {
      filtered = filtered.filter(terrain => 
        (terrain.rating?.average || 0) >= filters.minRating
      );
    }

    if (filters.userLocation && filters.maxDistance < 50) {
      filtered = filtered.filter(terrain => {
        const distance = calculateDistance(
          filters.userLocation!.lat,
          filters.userLocation!.lng,
          terrain.location.lat,
          terrain.location.lng
        );
        return distance <= filters.maxDistance;
      });
    }

    setFilteredTerrains(filtered);
    setCurrentPage(1);
  }, [terrains, filters]);

  useEffect(() => {
    if (!isRating) {
      setDisplayedTerrains(filteredTerrains.slice(0, displayedCount));
    }
  }, [filteredTerrains, displayedCount, isRating]);

  const loadMoreTerrains = () => {
    setDisplayedCount(prev => prev + terrainsPerPage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.type === 'file') {
      setForm({ ...form, image: (e.target as HTMLInputElement).files?.[0] || null });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('lat', form.lat);
    formData.append('lng', form.lng);
    formData.append('address', form.address);
    if (form.image) {
      formData.append('image', form.image);
    }

    const res = await fetch('/api/terrains', {
      method: 'POST',
      body: formData,
    });

    const savedTerrain = await res.json();
    setTerrains((prev) => [...prev, savedTerrain]);

    setForm({ 
      name: '', 
      description: '', 
      lat: '', 
      lng: '', 
      address: '', 
      image: null,
    });
    setShowForm(false);
  };

  const handleMapClick = (pos: { lat: number; lng: number; address?: string }) => {
    setForm({
      ...form,
      lat: pos.lat.toString(),
      lng: pos.lng.toString(),
      address: pos.address || '',
    });
    setShowForm(true);
  };

  const handleRating = async (terrainId: string, rating: number) => {
    try {
      setIsRating(true);
      const res = await fetch(`/api/terrains/${terrainId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
  
      if (res.ok) {
        const { rating: newRating } = await res.json();
        
        // Mettre à jour les terrains de base
        setTerrains(prev => 
          prev.map(t => t._id === terrainId ? { ...t, rating: newRating } : t)
        );

        // Mettre à jour les terrains filtrés
        setFilteredTerrains(prev => 
          prev.map(t => t._id === terrainId ? { ...t, rating: newRating } : t)
        );

        // Mettre à jour uniquement la note dans les terrains affichés
        setDisplayedTerrains(prev => 
          prev.map(t => t._id === terrainId ? { ...t, rating: newRating } : t)
        );
      }
    } catch (error) {
      console.error('Erreur lors de la notation:', error);
    } finally {
      setIsRating(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  const handleTerrainClick = (terrain: Terrain) => {
    setFocusedTerrain({
      lat: terrain.location.lat,
      lng: terrain.location.lng
    });
    
    const mapSection = document.querySelector('[data-map-section]');
    if (mapSection) {
      mapSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleAddTerrain = async (formData: FormData) => {
    try {
      const response = await fetch('/api/terrains', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'ajout du terrain');
      }

      const newTerrain = await response.json();
      
      // Mettre à jour les terrains avec le nouveau terrain
      setTerrains(prevTerrains => {
        const updatedTerrains = [newTerrain, ...prevTerrains];
        // Mettre à jour aussi les terrains filtrés
        setFilteredTerrains(updatedTerrains);
        // Mettre à jour les terrains affichés
        setDisplayedTerrains(updatedTerrains.slice(0, displayedCount));
        return updatedTerrains;
      });

      setShowAddTerrainModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du terrain:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return {
    terrains: displayedTerrains,
    allTerrains: terrains,
    displayedTerrains,
    showForm,
    showFilters,
    filters,
    form,
    setShowForm,
    setShowFilters,
    setFilters,
    handleChange,
    handleSubmit,
    handleMapClick,
    handleRating,
    getUserLocation,
    focusedTerrain,
    handleTerrainClick,
    loadMoreTerrains,
    hasMoreTerrains: displayedCount < filteredTerrains.length,
    showAddTerrainModal,
    showSuccessMessage,
    error,
    handleAddTerrain,
  };
}