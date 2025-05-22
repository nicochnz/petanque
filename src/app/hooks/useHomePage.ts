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
};

export function useHomePage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    address: '',
    image: null as File | null,
  });

  useEffect(() => {
    fetch('/api/terrains')
      .then(res => res.json())
      .then(data => setTerrains(data));
  }, []);

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

    setForm({ name: '', description: '', lat: '', lng: '', address: '', image: null });
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

  return {
    terrains,
    showForm,
    form,
    setShowForm,
    setForm,
    handleChange,
    handleSubmit,
    handleMapClick,
  };
}