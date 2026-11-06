import React, { memo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import BaseTileLayer from '../../config/mapTiles';
import L from 'leaflet';
import { Calendar, Layers, Sliders, MapPin, Info, AlertCircle } from 'lucide-react';

const satellitePinIcon = L.divIcon({
  className: 'earthpulse-satellite-pin',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transform: translateY(-10px);">
      <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(53, 208, 127, 0.3); border: 1.5px solid #35D07F; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(53, 208, 127, 0.6);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #35D07F; border: 2px solid #FFFFFF;"></div>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 24]
});

const RecenterSatelliteMap = memo(function RecenterSatelliteMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
});

const SatelliteClickHandler = memo(function SatelliteClickHandler({ onPinDrop }) {
  useMapEvents({
    click: (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      onPinDrop(lat, lon);
    }
  });
  return null;
});

const GIBS_LAYERS = [
  {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    name: 'Terra / MODIS True Color',
    format: 'jpg',
    matrixSet: 'GoogleMapsCompatible_Level9',
    description: 'Natural visible spectrum reflectance from Terra satellite'
  },
  {
    id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    name: 'Suomi NPP / VIIRS True Color',
    format: 'jpg',
    matrixSet: 'GoogleMapsCompatible_Level9',
    description: 'High-resolution true color imagery from Suomi NPP VIIRS'
  },
  {
    id: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
    name: 'Aqua / MODIS True Color',
    format: 'jpg',
    matrixSet: 'GoogleMapsCompatible_Level9',
    description: 'Afternoon true color observation from Aqua satellite'
  }
];

// Helper: default to yesterday YYYY-MM-DD
function getLatestAvailableDateStr() {
  const d = new Date();
  d.setDate(d.getDate() - 2); // 2 days ago for reliable complete global coverage
  return d.toISOString().split('T')[0];
}

export default memo(function NasaSatelliteView({
  selectedLocation,
  onLocationChange
}) {
  const [selectedLayer, setSelectedLayer] = useState(GIBS_LAYERS[0].id);
  const [satelliteDate, setSatelliteDate] = useState(getLatestAvailableDateStr());
  const [opacity, setOpacity] = useState(0.85);
  const [tileErrorCount, setTileErrorCount] = useState(0);

  useEffect(() => {
    setTileErrorCount(0);
  }, [selectedLayer, satelliteDate]);

  const { latitude, longitude, name } = selectedLocation;

  const currentLayerConfig = GIBS_LAYERS.find((l) => l.id === selectedLayer) || GIBS_LAYERS[0];
  const gibsTileUrl = `https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/${currentLayerConfig.id}/default/${satelliteDate}/${currentLayerConfig.matrixSet}/{z}/{y}/{x}.${currentLayerConfig.format}`;

  const handleSatelliteClick = (lat, lon) => {
    onLocationChange(`Location (${lat > 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${lon > 0 ? lon + '°E' : Math.abs(lon) + '°W'})`, lat, lon);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0D1B2A] p-2.5 rounded-xl border border-[#1E3A56] text-xs">
        {/* Layer Selector */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#00D4FF] shrink-0" />
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="flex-1 bg-[#13263A] border border-[#1E3A56] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#00D4FF]"
          >
            {GIBS_LAYERS.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#35D07F] shrink-0" />
          <input
            type="date"
            value={satelliteDate}
            max={getLatestAvailableDateStr()}
            onChange={(e) => setSatelliteDate(e.target.value)}
            className="flex-1 bg-[#13263A] border border-[#1E3A56] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 w-14 shrink-0 font-mono">
            {Math.round(opacity * 100)}% Opacity
          </span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-[#00D4FF]"
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[420px] rounded-xl overflow-hidden border border-[#1E3A56] relative">
        <MapContainer
          key="earthpulse-nasa-satellite-map"
          center={[latitude, longitude]}
          zoom={3}
          minZoom={2}
          maxZoom={9} // GIBS GoogleMapsCompatible_Level9 limits zoom to 9
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          {/* Shared Resilient Dark Basemap (Esri with OSM fallback) */}
          <BaseTileLayer />

          {/* NASA GIBS WMTS Satellite Layer */}
          <TileLayer
            key={gibsTileUrl}
            url={gibsTileUrl}
            attribution='Imagery &copy; <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>'
            opacity={opacity}
            maxZoom={9}
            subdomains={['a', 'b', 'c']}
            noWrap={true}
            eventHandlers={{
              tileerror: () => setTileErrorCount((c) => c + 1)
            }}
          />

          <SatelliteClickHandler onPinDrop={handleSatelliteClick} />
          <RecenterSatelliteMap center={[latitude, longitude]} />
          <Marker position={[latitude, longitude]} icon={satellitePinIcon} />
        </MapContainer>

        {/* GIBS Badge */}
        <div className="absolute top-2.5 right-2.5 z-[1000] bg-[#071426]/90 border border-[#1E3A56] px-3 py-1.5 rounded-lg text-[11px] text-slate-300 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse"></span>
          <span className="font-semibold text-white">NASA GIBS WMTS Live</span>
          <span className="text-slate-400 font-mono">({satelliteDate})</span>
        </div>

        {tileErrorCount >= 4 && (
          <div className="absolute top-12 right-2.5 z-[1000] bg-amber-950/90 border border-amber-600/50 px-3 py-1.5 rounded-lg text-xs text-amber-200 flex items-center space-x-1.5 shadow-lg">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Imagery unavailable for this date</span>
          </div>
        )}

        {/* Bottom Location Indicator */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-[#071426]/90 border border-[#1E3A56] px-3 py-1 rounded-lg text-[11px] text-slate-300 flex items-center space-x-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-[#35D07F]" />
          <span>Click to select location on NASA imagery &bull; Max GIBS Zoom: Level 9</span>
        </div>
      </div>
    </div>
  );
});
