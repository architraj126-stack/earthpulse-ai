import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Compass, Navigation } from 'lucide-react';

// Custom Leaflet DivIcon with Cyan Radar Pulse
const createPulseIcon = () => {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(0, 212, 255, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #00D4FF; border: 2px solid #FFFFFF; box-shadow: 0 0 10px #00D4FF;"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map Recenter Helper Component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener
function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click: async (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      
      let locName = `Location (${lat}, ${lon})`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        if (res.ok) {
          const data = await res.json();
          locName = data.display_name?.split(',').slice(0, 3).join(', ') || locName;
        }
      } catch (err) {
        // Fallback to coordinates
      }
      onLocationChange(locName, lat, lon);
    }
  });
  return null;
}

const PRESET_LOCATIONS = [
  { name: 'Bengaluru, Karnataka (Default)', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'New Delhi, NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York, United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 }
];

export default function InteractiveMap({
  locationName = 'Bengaluru, Karnataka',
  latitude = 12.9716,
  longitude = 77.5946,
  onLocationChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [manualLat, setManualLat] = useState(latitude);
  const [manualLon, setManualLon] = useState(longitude);

  useEffect(() => {
    setManualLat(latitude);
    setManualLon(longitude);
  }, [latitude, longitude]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(parseFloat(item.lat).toFixed(4));
          const lon = parseFloat(parseFloat(item.lon).toFixed(4));
          const name = item.display_name?.split(',').slice(0, 3).join(', ') || searchQuery;
          onLocationChange(name, lat, lon);
        } else {
          alert('Location not found. Please try another place name or enter coordinates manually.');
        }
      }
    } catch (err) {
      alert('Geocoding service unavailable. You can enter latitude and longitude coordinates directly.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualApply = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and +90 degrees.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('Longitude must be between -180 and +180 degrees.');
      return;
    }
    onLocationChange(`Point (${lat}, ${lon})`, lat, lon);
  };

  return (
    <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 shadow-lg space-y-4">
      {/* Top Controls: Search and Presets */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, region, or landmark..."
            className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3.5 py-2 pl-9 text-sm text-white placeholder-[#9BAEC2] focus:outline-none focus:border-[#00D4FF]"
          />
          <Search className="w-4 h-4 text-[#9BAEC2] absolute left-3 top-2.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#00D4FF] text-[#071426] rounded text-xs font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Locate'}
          </button>
        </form>

        {/* Global Preset Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            onChange={(e) => {
              const selected = PRESET_LOCATIONS.find(p => p.name === e.target.value);
              if (selected) {
                onLocationChange(selected.name, selected.lat, selected.lon);
              }
            }}
            className="w-full sm:w-auto bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
            value={PRESET_LOCATIONS.find(p => Math.abs(p.lat - latitude) < 0.05 && Math.abs(p.lon - longitude) < 0.05)?.name || ''}
          >
            <option value="" disabled>Select Quick City Preset</option>
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative h-72 sm:h-80 w-full rounded-lg overflow-hidden border border-[#1E3A56]">
        <MapContainer
          center={[latitude, longitude]}
          zoom={8}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <ChangeView center={[latitude, longitude]} zoom={8} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationChange={onLocationChange} />
          <Marker position={[latitude, longitude]} icon={createPulseIcon()}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-[#00D4FF]">{locationName}</div>
                <div className="text-[#9BAEC2]">Lat: {latitude.toFixed(4)}°, Lon: {longitude.toFixed(4)}°</div>
                <div className="text-[10px] text-gray-400">Click anywhere on map to reposition target point.</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map Overlay Badge */}
        <div className="absolute bottom-2 left-2 z-[400] bg-[#071426]/90 backdrop-blur-sm border border-[#1E3A56] px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">{locationName}</span>
          <span className="text-[#9BAEC2] font-mono text-[11px]">({latitude.toFixed(4)}°, {longitude.toFixed(4)}°)</span>
        </div>
      </div>

      {/* Manual Coordinate Inputs */}
      <div className="bg-[#0D1B2A] rounded-lg p-3 border border-[#1E3A56] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#9BAEC2]">
          <Compass className="w-4 h-4 text-[#00D4FF]" />
          <span>Manual Coordinate Entry:</span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="flex items-center gap-1">
            <span className="text-[#9BAEC2]">Lat:</span>
            <input
              type="number"
              step="0.0001"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-24 bg-[#13263A] border border-[#1E3A56] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#9BAEC2]">Lon:</span>
            <input
              type="number"
              step="0.0001"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              className="w-24 bg-[#13263A] border border-[#1E3A56] rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
          <button
            onClick={handleManualApply}
            className="px-3 py-1 bg-[#1E3A56] hover:bg-[#00D4FF] hover:text-[#071426] text-white rounded font-medium transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
