import React, { useState, useCallback, useRef } from 'react';
import { TileLayer } from 'react-leaflet';
import { useTheme } from '../theme/ThemeContext';

export const PRIMARY_BASEMAP = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  lightUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxNativeZoom: 16,
  maxZoom: 16
};

export const FALLBACK_BASEMAP = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
};

/**
 * Shared BaseTileLayer component.
 * Uses Esri World Dark/Light Gray Base matching active theme,
 * falling back to OpenStreetMap after 8 tile errors.
 */
export function BaseTileLayer() {
  const { theme } = useTheme();
  const [useFallback, setUseFallback] = useState(false);
  const errorCountRef = useRef(0);
  const hasWarnedRef = useRef(false);

  const handleTileError = useCallback(() => {
    if (useFallback) return;
    errorCountRef.current += 1;
    if (errorCountRef.current >= 8) {
      if (!hasWarnedRef.current) {
        console.warn(
          'Esri basemap encountered 8+ tile errors. Switching to OpenStreetMap fallback.'
        );
        hasWarnedRef.current = true;
      }
      setUseFallback(true);
    }
  }, [useFallback]);

  if (useFallback) {
    return React.createElement(TileLayer, {
      key: `fallback-osm-layer-${theme}`,
      url: FALLBACK_BASEMAP.url,
      attribution: FALLBACK_BASEMAP.attribution,
      maxZoom: FALLBACK_BASEMAP.maxZoom,
      className: theme === 'dark' ? 'osm-dark-tiles' : ''
    });
  }

  return React.createElement(TileLayer, {
    key: `primary-esri-layer-${theme}`,
    url: theme === 'dark' ? PRIMARY_BASEMAP.url : PRIMARY_BASEMAP.lightUrl,
    attribution: PRIMARY_BASEMAP.attribution,
    maxNativeZoom: PRIMARY_BASEMAP.maxNativeZoom,
    maxZoom: PRIMARY_BASEMAP.maxZoom,
    eventHandlers: {
      tileerror: handleTileError
    }
  });
}

export default BaseTileLayer;
