import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CircularProgress } from '@mui/material';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

const TYPE_LABELS = {
  coleta: "Coleta Seletiva",
  verde: "Área Verde",
  feira: "Feira Orgânica"
};

// Sub-componente para gerenciar o movimento da câmera
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

// Recalcula o tamanho do mapa quando o container muda (grid/flex, resize da janela),
// evitando áreas em branco / tiles incompletos
function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const ro = new ResizeObserver(invalidate);
    ro.observe(map.getContainer());
    window.addEventListener("resize", invalidate);
    // Correção inicial após o layout assentar
    const t = setTimeout(invalidate, 100);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", invalidate);
      clearTimeout(t);
    };
  }, [map]);
  return null;
}

export default function MapView({ points, user, onEdit, onDelete }) {
  const [position, setPosition] = useState(null); // null = aguardando localização
  const tileRef = useRef(null);

  useEffect(() => {
    let done = false;
    const setOnce = (coords) => {
      if (!done) { done = true; setPosition(coords); }
    };
    // Fallback: se o usuário não responder ao prompt, centraliza em São Paulo
    const fallback = setTimeout(() => setOnce([-23.5489, -46.6388]), 5000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallback);
        setOnce([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        clearTimeout(fallback);
        console.error("Erro ao obter localização:", error);
        setOnce([-23.5489, -46.6388]);
      }
    );
    return () => clearTimeout(fallback);
  }, []);

  // Retenta tiles que falharam (evita quadrados brancos permanentes)
  useEffect(() => {
    const layer = tileRef.current;
    if (!layer) return;
    const EMPTY_GIF = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAAD/ACwAAAAAAAQDBA/3BAI";
    const onTileError = (e) => {
      const img = e.tile && e.tile.el;
      if (!img || !img.src || img.dataset.retried) return;
      img.dataset.retried = "1";
      const src = img.src;
      setTimeout(() => {
        img.src = EMPTY_GIF;
        setTimeout(() => { if (img.parentNode) img.src = src; }, 150);
      }, 400);
    };
    layer.on("tileerror", onTileError);
    return () => layer.off("tileerror", onTileError);
  }, [position]);

  if (!position) {
    return (
      <div className="map-loading">
        <CircularProgress size={28} />
        <span>Localizando…</span>
      </div>
    );
  }

  const getIcon = (type) => {
    let iconUrl;
    switch(type) {
      case "coleta": 
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
        break;
      case "verde":
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png";
        break;
      case "feira":
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png";
        break;
      default: 
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";
    }
    return new L.Icon({
      iconUrl: iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
      >
        <ChangeView center={position} />
        <MapSizeFix />
        
        <TileLayer
          ref={tileRef}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

        {points.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.latitude, point.longitude]} 
            icon={getIcon(point.type)}
          >
            <Popup>
              <strong>{point.name}</strong><br/>
              {point.description || "Sem descrição"}<br/>
              <small>Tipo: {TYPE_LABELS[point.type] || point.type}</small>
              {user && point.userId === user.uid && (
                <div className="popup-actions">
                  <button className="btn-edit" onClick={() => onEdit(point)}>Editar</button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      if (window.confirm(`Remover o ponto "${point.name}" do mapa?`)) onDelete(point);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}