'use client';

type FilterPanelProps = {
  filters: {
    minRating: number;
    maxDistance: number;
    userLocation: { lat: number; lng: number } | null;
  };
  onFiltersChange: (filters: {
    minRating: number;
    maxDistance: number;
    userLocation: { lat: number; lng: number } | null;
  }) => void;
  onGetLocation: () => void;
  onClose: () => void;
  totalResults: number;
};

export default function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onGetLocation, 
  onClose, 
  totalResults 
}: FilterPanelProps) {
  
  const resetFilters = () => {
    onFiltersChange({
      minRating: 0,
      maxDistance: 50,
      userLocation: filters.userLocation
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-900">Filtres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Notation minimale */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Note minimale
          </label>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(rating => (
              <button
                key={rating}
                onClick={() => onFiltersChange({ ...filters, minRating: rating })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.minRating === rating
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating === 0 ? 'Toutes' : `${rating}+ ⭐`}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Distance maximale: {filters.maxDistance === 50 ? 'Illimitée' : `${filters.maxDistance} km`}
          </label>
          
          {!filters.userLocation && (
            <button
              onClick={onGetLocation}
              className="w-full mb-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              📍 Utiliser ma position
            </button>
          )}
          
          {filters.userLocation && (
            <div>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.maxDistance}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  maxDistance: parseInt(e.target.value) 
                })}
                className="w-full mb-2 accent-amber-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all"
          >
            Voir {totalResults} résultat{totalResults > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}