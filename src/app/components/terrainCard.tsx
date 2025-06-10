import Image from "next/image";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/outline";

const TerrainCard = ({ terrain, onRate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {terrain.imageUrl && (
        <div className="relative h-48">
          <Image
            src={terrain.imageUrl}
            alt={terrain.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{terrain.name}</h3>
        <p className="text-gray-600 mb-4">{terrain.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1">
              {terrain.rating.count > 0 
                ? `${terrain.rating.average.toFixed(1)} (${terrain.rating.count})`
                : 'Soyez le premier à noter !'}
            </span>
          </div>
          {terrain.location?.address && (
            <div className="flex items-center text-gray-500">
              <MapPinIcon className="h-5 w-5 mr-1" />
              <span>{terrain.location.address}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onRate(terrain._id)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Noter
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerrainCard; 