import React, { useState, useCallback, useRef } from 'react';
import { TileLayer } from 'react-leaflet';

export const PRIMARY_BASEMAP = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
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
 * Uses Esri World Dark Gray Base by default.
 * Automatically falls back to dark-styled OpenStreetMap if 8+ tile errors occur.
 */
export function BaseTileLayer() {
  const [useFallback, setUseFallback] = useState(false);
  const errorCountRef = useRef(0);
  const hasWarnedRef = useRef(false);

  const handleTileError = useCallback(() => {
    if (useFallback) return;
    errorCountRef.current += 1;
    if (errorCountRef.current >= 8) {
      if (!hasWarnedRef.current) {
        console.warn(
          'Esri Dark Gray basemap encountered 8+ tile errors. Switching to OpenStreetMap dark fallback.'
        );
        hasWarnedRef.current = true;
      }
      setUseFallback(true);
    }
  }, [useFallback]);

  if (useFallback) {
    return React.createElement(TileLayer, {
      key: 'fallback-osm-layer',
      url: FALLBACK_BASEMAP.url,
      attribution: FALLBACK_BASEMAP.attribution,
      maxZoom: FALLBACK_BASEMAP.maxZoom,
      className: 'osm-dark-tiles'
    });
  }

  return React.createElement(TileLayer, {
    key: 'primary-esri-layer',
    url: PRIMARY_BASEMAP.url,
    attribution: PRIMARY_BASEMAP.attribution,
    maxNativeZoom: PRIMARY_BASEMAP.maxNativeZoom,
    maxZoom: PRIMARY_BASEMAP.maxZoom,
    eventHandlers: {
      tileerror: handleTileError
    }
  });
}

export default BaseTileLayer;
