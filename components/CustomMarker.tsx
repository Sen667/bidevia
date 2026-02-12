import L from 'leaflet';

export function getBlackDotIcon({ color = '#000000', size = 12 }: { color?: string, size?: number } = {}) {
  // Le viewBox est ajusté pour laisser de la place au halo (pulse) sans couper le SVG
  const svg = `
    <svg width="${size * 2}" height="${size * 2}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <style>
        .pulse {
          fill: #fff;
          fill-opacity: 0.3;
          transform-origin: center;
          animation: pulse-animation 2s infinite ease-out;
        }
        .dot {
          fill: ${color};
          stroke: #fff;
          stroke-width: 1;
        }
        @keyframes pulse-animation {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
      <circle class="pulse" cx="20" cy="20" r="8" />
      <circle class="dot" cx="20" cy="20" r="5" />
    </svg>
  `.trim();

  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return L.icon({
    iconUrl: svgUrl,
    iconSize: [size * 4, size * 4],
    iconAnchor: [(size * 4) / 2, (size * 4) / 2],
    popupAnchor: [0, -size],
    className: 'ios-dot-black',
  });
}

export default getBlackDotIcon;