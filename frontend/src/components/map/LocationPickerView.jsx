import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Compass, Loader2 } from 'lucide-react';

// Reverse Geocoding Cache (in-memory)
const geocodeCache = new Map();
let lastNominatimRequestTime = 0;

// High-performance static cyan marker with one-shot drop animation
const locationIcon = L.divIcon({
  className: 'earthpulse-map-pin',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: translateY(-10px);">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(0, 212, 255, 0.25); border: 1.5px solid #00D4FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #00D4FF; border: 2px solid #FFFFFF;"></div>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 24]
});

// Memoized Map Recenter Helper
const RecenterMap = memo(function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
});

// Map Click Handler with immediate optimistic pin drop (<50ms)
const ClickHandler = memo(function ClickHandler({ onPinDrop }) {
  useMapEvents({
    click: (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      onPinDrop(lat, lon);
    }
  });
  return null;
});

const PRESET_HOTSPOTS = [
  { name: 'Amazon Basin', lat: -3.4653, lon: -62.2159, tag: 'Deforestation & Moisture' },
  { name: 'Sahel Region', lat: 14.4974, lon: 14.4524, tag: 'Desertification' },
  { name: 'Greenland Ice Sheet', lat: 72.0, lon: -40.0, tag: 'Polar Amplification' },
  { name: 'Aral Sea Basin', lat: 45.0, lon: 60.0, tag: 'Desiccation' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, tag: 'Urban Heat Island' },
  { name: 'New Delhi NCR', lat: 28.6139, lon: 77.2090, tag: 'Continental Extremes' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, tag: 'Coastal Warming' }
];

export default memo(function LocationPickerView({
  selectedLocation,
  onLocationChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const { latitude, longitude, name } = selectedLocation;

  // Optimistic Pin Drop: immediately moves pin <50ms, then asynchronously resolves name
  const handlePinDrop = useCallback((lat, lon) => {
    const coordsKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    
    // 1. Immediately fire optimistic update (<50ms) with coordinate label
    if (geocodeCache.has(coordsKey)) {
      onLocationChange(geocodeCache.get(coordsKey), lat, lon);
      return;
    }

    onLocationChange(`Location (${lat > 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${lon > 0 ? lon + '°E' : Math.abs(lon) + '°W'})`, lat, lon);

    // 2. Cancel previous in-flight geocode
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 3. Debounce Nominatim lookup (600ms) respecting 1 req/sec policy
    setIsGeocoding(true);
    debounceTimerRef.current = setTimeout(async () => {
      const now = Date.now();
      const delay = Math.max(0, 1000 - (now - lastNominatimRequestTime));
      lastNominatimRequestTime = now + delay;

      abortControllerRef.current = new AbortController();
      try {
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
          {
            signal: abortControllerRef.current.signal,
            headers: { 'Accept-Language': 'en' }
          }
        );
        if (res.ok) {
          const data = await res.json();
          const placeName = data.display_name?.split(',').slice(0, 3).join(', ') || `Location (${lat}, ${lon})`;
          geocodeCache.set(coordsKey, placeName);
          onLocationChange(placeName, lat, lon);
        }
      } catch (err) {
        // Silently preserve coordinates if aborted or offline
      } finally {
        setIsGeocoding(false);
      }
    }, 600);
  }, [onLocationChange]);

  // Search by place name
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(parseFloat(item.lat).toFixed(4));
          const lon = parseFloat(parseFloat(item.lon).toFixed(4));
          const placeName = item.display_name?.split(',').slice(0, 3).join(', ') || searchQuery;
          geocodeCache.set(`${lat.toFixed(2)},${lon.toFixed(2)}`, placeName);
          onLocationChange(placeName, lat, lon);
        } else {
          alert('Location not found. Try another place name or click anywhere on the map.');
        }
      }
    } catch {
      alert('Geocoding search temporarily unavailable. You can click on the map to place a pin directly.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Search & Coordinates Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#0D1B2A] p-2.5 rounded-xl border border-[#1E3A56]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, country or landmark..."
            className="w-full bg-[#13263A] border border-[#1E3A56] rounded-lg pl-9 pr-24 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00D4FF]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1 px-3 py-1 bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] border border-[#00D4FF]/40 rounded text-xs font-semibold flex items-center space-x-1"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-[#13263A] px-3 py-1.5 rounded-lg border border-[#1E3A56]/60">
          <MapPin className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
          <span className="truncate max-w-[200px]" title={name}>{name}</span>
          <span className="text-[#00D4FF]">({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)</span>
          {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-[#00D4FF] shrink-0" />}
        </div>
      </div>

      {/* Preset Hotspot Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
        <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 text-[11px] pr-1">Hotspots:</span>
        {PRESET_HOTSPOTS.map((spot) => {
          const isSelected = Math.abs(spot.lat - latitude) < 0.05 && Math.abs(spot.lon - longitude) < 0.05;
          return (
            <button
              key={spot.name}
              type="button"
              onClick={() => onLocationChange(spot.name, spot.lat, spot.lon)}
              className={`shrink-0 px-2.5 py-1 rounded-full border transition-all text-xs flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF] font-semibold'
                  : 'bg-[#13263A]/80 text-slate-300 border-[#1E3A56] hover:border-[#00D4FF]/50 hover:text-white'
              }`}
            >
              <span>{spot.name}</span>
            </button>
          );
        })}
      </div>

      {/* Clean Leaflet Map Container */}
      <div className="flex-1 w-full min-h-[360px] rounded-xl overflow-hidden border border-[#1E3A56] relative">
        <MapContainer
          key="earthpulse-location-picker-map"
          center={[latitude, longitude]}
          zoom={3}
          minZoom={2}
          maxZoom={14}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          {/* CartoDB Dark Matter Basemap */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
            subdomains="abcd"
          />
          <ClickHandler onPinDrop={handlePinDrop} />
          <RecenterMap center={[latitude, longitude]} />
          <Marker position={[latitude, longitude]} icon={locationIcon} />
        </MapContainer>

        {/* Click instructions banner */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-[#071426]/90 border border-[#1E3A56] px-3 py-1 rounded-lg text-[11px] text-slate-300 flex items-center space-x-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>Click anywhere to drop pin &bull; Pin appears &lt;50ms</span>
        </div>
      </div>
    </div>
  );
});
