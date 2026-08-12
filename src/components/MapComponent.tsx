import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const { BaseLayer, Overlay } = LayersControl;

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

import { useEffect } from 'react';

export function MapComponent({ lat, lng }: { lat: number, lng: number }) {
    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner">
            <MapContainer 
                center={[lat, lng]} 
                zoom={15} 
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <ZoomControl position="bottomright" />
                
                <LayersControl position="topright">
                    <BaseLayer checked name="Satellite">
                        <TileLayer 
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; Esri'
                        />
                    </BaseLayer>
                    <BaseLayer name="Terrain">
                        <TileLayer 
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenTopoMap'
                        />
                    </BaseLayer>
                    <BaseLayer name="Clean Light">
                        <TileLayer 
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; CARTO'
                        />
                    </BaseLayer>

                    <Overlay checked name="Selected Plot">
                        <Marker position={[lat, lng]}>
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-sm text-slate-900">Analysis Point</p>
                                    <p className="text-xs text-slate-500 font-mono">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                                </div>
                            </Popup>
                        </Marker>
                    </Overlay>
                </LayersControl>
                <MapUpdater center={[lat, lng]} />
            </MapContainer>
            
            <div className="absolute bottom-4 left-4 theme-card/90 backdrop-blur-md p-3 rounded-xl shadow-lg z-[1000] text-[10px] space-y-2 border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                    <span className="font-mono font-bold tracking-tight">LAT: {lat.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-harvest-green rounded-full"></div>
                    <span className="font-mono font-bold tracking-tight">LNG: {lng.toFixed(6)}</span>
                </div>
            </div>
        </div>
    );
}
