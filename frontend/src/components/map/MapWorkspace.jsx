import React, { memo, useState, useCallback } from 'react';
import { MapPin, Satellite, Globe, Compass } from 'lucide-react';
import LocationPickerView from './LocationPickerView';
import NasaSatelliteView from './NasaSatelliteView';
import GlobalTrendMapView from './GlobalTrendMapView';

const TABS = [
  { id: 'picker', label: 'Location Picker', icon: MapPin, desc: 'Pin Drop & Hotspot Presets' },
  { id: 'satellite', label: 'NASA Satellite', icon: Satellite, desc: 'NASA GIBS WMTS Imagery' },
  { id: 'atlas', label: 'Global Trend Map', icon: Globe, desc: '5° Sen\'s Slope Heatmap' }
];

export default memo(function MapWorkspace({
  locationName = 'Bengaluru, Karnataka',
  latitude = 12.9716,
  longitude = 77.5946,
  onLocationChange,
  activeVariable = 'T2M'
}) {
  const [activeTab, setActiveTab] = useState('picker');

  // Internal local map state to prevent premature dashboard/chart recalculations
  const [selectedLocation, setSelectedLocation] = useState({
    name: locationName,
    latitude: latitude,
    longitude: longitude
  });

  const handleLocationUpdate = useCallback((newName, newLat, newLon) => {
    setSelectedLocation({
      name: newName,
      latitude: newLat,
      longitude: newLon
    });
    // Inform parent (Dashboard or Compare)
    if (onLocationChange) {
      onLocationChange(newName, newLat, newLon);
    }
  }, [onLocationChange]);

  return (
    <div className="flex flex-col h-full bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 shadow-xl">
      {/* Top Map Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#1E3A56]">
        <div className="flex items-center space-x-1.5 p-1 bg-[#0D1B2A] rounded-xl border border-[#1E3A56]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00D4FF] text-[#071426] shadow-md shadow-[#00D4FF]/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#13263A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#071426]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Coordinates Status Badge */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-[#0D1B2A] px-3 py-1.5 rounded-xl border border-[#1E3A56]">
          <Compass className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]" title={selectedLocation.name}>
            {selectedLocation.name}
          </span>
          <span className="text-[#00D4FF]">
            [{selectedLocation.latitude.toFixed(2)}°, {selectedLocation.longitude.toFixed(2)}°]
          </span>
        </div>
      </div>

      {/* Tab View Container */}
      <div className="flex-1 min-h-[420px]">
        {activeTab === 'picker' && (
          <LocationPickerView
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationUpdate}
          />
        )}
        {activeTab === 'satellite' && (
          <NasaSatelliteView
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationUpdate}
          />
        )}
        {activeTab === 'atlas' && (
          <GlobalTrendMapView
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationUpdate}
            activeVariable={activeVariable}
          />
        )}
      </div>
    </div>
  );
});
