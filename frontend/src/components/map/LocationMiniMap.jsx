import React, { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { MapContainer, Marker, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';
import BaseTileLayer from '../../config/mapTiles';
import { useTheme } from '../../theme/ThemeContext';
import { getDivergingColor } from '../../utils/climateMath';

const geocodeCache = new Map();
let lastNominatimRequestTime = 0;

const RecenterMiniMap = memo(function RecenterMiniMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
});

const MiniMapClickHandler = memo(function MiniMapClickHandler({ onPinDrop }) {
  useMapEvents({
    click: (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      onPinDrop(lat, lon);
    }
  });
  return null;
});

export default memo(function LocationMiniMap({
  latitude,
  longitude,
  locationName,
  onLocationChange,
  atlasCells = [],
  activeVariable = 'T2M'
}) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: 'terra-mini-pin',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${colors.accent};border:2.5px solid ${colors.panel};box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      }),
    [colors.accent, colors.panel]
  );

  // Sample every 6th cell for crisp lightweight mini choropleth context
  const sampledCells = useMemo(() => {
    if (!atlasCells || atlasCells.length === 0) return [];
    const maxMag = activeVariable === 'T2M' ? 0.75 : activeVariable === 'PRECTOTCORR' ? 0.2 : 1.0;
    return atlasCells
      .filter((_, i) => i % 6 === 0)
      .map((c) => {
        const slope = c.sens_slope_per_decade ?? c.sen_slope_per_decade ?? 0;
        return {
          lat: c.latitude,
          lon: c.longitude,
          color: getDivergingColor(slope, maxMag, colors, 0.75)
        };
      });
  }, [atlasCells, activeVariable, colors]);

  const handlePinDrop = useCallback(
    (lat, lon) => {
      setSearchError(null);
      const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
      if (geocodeCache.has(key)) {
        onLocationChange(geocodeCache.get(key), lat, lon);
        return;
      }

      onLocationChange(
        `Coords (${lat >= 0 ? lat.toFixed(2) + '°N' : Math.abs(lat).toFixed(2) + '°S'}, ${
          lon >= 0 ? lon.toFixed(2) + '°E' : Math.abs(lon).toFixed(2) + '°W'
        })`,
        lat,
        lon
      );

      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);

      setIsGeocoding(true);
      debounceRef.current = setTimeout(async () => {
        const now = Date.now();
        const delay = Math.max(0, 1000 - (now - lastNominatimRequestTime));
        lastNominatimRequestTime = now + delay;
        abortRef.current = new AbortController();
        try {
          if (delay > 0) await new Promise((r) => setTimeout(r, delay));
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
            { signal: abortRef.current.signal, headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const place =
              data.display_name?.split(',').slice(0, 2).join(', ') ||
              `Coords (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
            geocodeCache.set(key, place);
            onLocationChange(place, lat, lon);
          }
        } catch {
          // Preserve coordinates silently if aborted or offline
        } finally {
          setIsGeocoding(false);
        }
      }, 600);
    },
    [onLocationChange]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const best = results[0];
          const lat = parseFloat(parseFloat(best.lat).toFixed(4));
          const lon = parseFloat(parseFloat(best.lon).toFixed(4));
          const placeName = best.display_name.split(',').slice(0, 2).join(', ');
          geocodeCache.set(`${lat.toFixed(2)},${lon.toFixed(2)}`, placeName);
          onLocationChange(placeName, lat, lon);
        } else {
          setSearchError('No location matched. Click directly on map.');
        }
      }
    } catch {
      setSearchError('Search offline. Click map to drop pin.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Place Search */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search city or region..."
          aria-label="Search geographic location"
          className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-[10px] pl-8 pr-14 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2" aria-hidden="true" />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-1 top-1 px-2 py-0.5 rounded-[7px] bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-semibold"
        >
          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Go'}
        </button>
      </form>

      {searchError && <p className="text-[11px] text-[var(--warn)]">{searchError}</p>}

      {/* Small Choropleth Mini-Map */}
      <div className="h-[175px] w-full rounded-[12px] overflow-hidden border border-[var(--border)] relative">
        <MapContainer
          key="mission-control-mini-map"
          center={[latitude, longitude]}
          zoom={2}
          minZoom={1}
          maxZoom={14}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ minHeight: '175px' }}
        >
          <BaseTileLayer />
          {sampledCells.map((c, i) => (
            <CircleMarker
              key={i}
              center={[c.lat, c.lon]}
              radius={3}
              pathOptions={{ stroke: false, fillColor: c.color, fillOpacity: 0.65 }}
              interactive={false}
            />
          ))}
          <MiniMapClickHandler onPinDrop={handlePinDrop} />
          <RecenterMiniMap center={[latitude, longitude]} />
          <Marker position={[latitude, longitude]} icon={pinIcon} />
        </MapContainer>

        <div className="pointer-events-none absolute bottom-1.5 left-1.5 z-[500] px-2 py-0.5 rounded-full bg-[var(--panel)]/90 border border-[var(--border)] text-[10px] text-[var(--muted)]">
          Click map to pick coordinates
        </div>
      </div>

      {/* Place & Lat/Lon Readout */}
      <div className="flex items-center justify-between gap-2 bg-[var(--panel)] border border-[var(--border)] rounded-[10px] px-2.5 py-1.5 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
          <span className="font-medium text-[var(--text)] truncate" title={locationName}>
            {locationName}
          </span>
          {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)] shrink-0" />}
        </div>
        <span className="font-mono text-[var(--muted)] shrink-0">
          {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
        </span>
      </div>
    </div>
  );
});
