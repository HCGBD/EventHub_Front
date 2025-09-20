import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ initialCoordinates, onCoordinatesChange }) {
  const [position, setPosition] = useState(() => {
    if (initialCoordinates && initialCoordinates.latitude && initialCoordinates.longitude) {
      return [initialCoordinates.latitude, initialCoordinates.longitude];
    }
    return [48.8566, 2.3522]; // Default to Paris if no initial coordinates
  });

  const markerRef = useRef(null);
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onCoordinatesChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onCoordinatesChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (initialCoordinates && initialCoordinates.latitude && initialCoordinates.longitude) {
      const newPos = [initialCoordinates.latitude, initialCoordinates.longitude];
      setPosition(newPos);
      map.setView(newPos, map.getZoom()); // Center map on new position
    }
  }, [initialCoordinates, map]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
          onCoordinatesChange({ latitude: latlng.lat, longitude: latlng.lng });
        }
      },
    }),
    [onCoordinatesChange],
  );

  // Bug fix: The dragend event handler has a typo. It should be latlng.lng for longitude.
  // Corrected eventHandlers:
  const correctedEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
          onCoordinatesChange({ latitude: latlng.lat, longitude: latlng.lng });
        }
      },
    }),
    [onCoordinatesChange],
  );


  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={correctedEventHandlers} // Use corrected event handlers
      ref={markerRef}
    >
    </Marker>
  );
}

export function MapInput({ initialCoordinates, onCoordinatesChange }) {
  const defaultCenter = initialCoordinates && initialCoordinates.latitude && initialCoordinates.longitude
    ? [initialCoordinates.latitude, initialCoordinates.longitude]
    : [9.5379, -13.6773]; // Default to Conakry, Guinea

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          initialCoordinates={initialCoordinates}
          onCoordinatesChange={onCoordinatesChange}
        />
      </MapContainer>
    </div>
  );
}
