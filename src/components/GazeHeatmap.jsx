import { useRef, useEffect } from 'react';

/**
 * GazeHeatmap — renders a canvas heatmap of gaze fixation points.
 * Uses a gaussian kernel for each point in a diagnostic monitor frame.
 * Dual-mode: supports both normalized [0..1] and screen pixel coordinates.
 */
export default function GazeHeatmap({ gazePoints = [], width = 640, height = 280, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Clinical Dark Slate Canvas for high biomarker contrast
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!gazePoints || gazePoints.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO OPTICAL SAMPLES RECORDED', width / 2, height / 2);
      return;
    }

    // Determine coordinate domain (screen pixels vs normalized [0..1])
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < gazePoints.length; i++) {
      const p = gazePoints[i];
      if (p && typeof p.x === 'number' && p.x > maxX) maxX = p.x;
      if (p && typeof p.y === 'number' && p.y > maxY) maxY = p.y;
    }
    const isNormalized = maxX <= 1.05 && maxY <= 1.05;

    // Convert all points to canvas pixel coordinates
    const pts = gazePoints
      .filter((pt) => pt && typeof pt.x === 'number' && typeof pt.y === 'number' && !isNaN(pt.x) && !isNaN(pt.y))
      .map((pt) => {
        let normX = isNormalized ? pt.x : pt.x / (window.innerWidth || 1920);
        let normY = isNormalized ? pt.y : pt.y / (window.innerHeight || 1080);
        normX = Math.max(0, Math.min(1, normX));
        normY = Math.max(0, Math.min(1, normY));
        return {
          x: normX * width,
          y: normY * height,
        };
      });

    if (pts.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Space Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO VALID OPTICAL SAMPLES', width / 2, height / 2);
      return;
    }

    // Draw gaussian blobs per point
    const baseRadius = Math.max(16, Math.round(width * 0.04));
    pts.forEach((pt) => {
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, baseRadius);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.22)');
      grad.addColorStop(0.5, 'rgba(34, 197, 94, 0.08)');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Highlight hot zones with brighter amber, lime & emerald
    const clusterRadius = Math.max(22, Math.round(width * 0.055));
    const hotZones = clusterPoints(pts, clusterRadius);
    hotZones.forEach((zone) => {
      const intensity = Math.min(zone.count / 20, 1);
      const r = 16 + intensity * 24;
      const grad = ctx.createRadialGradient(zone.cx, zone.cy, 0, zone.cx, zone.cy, r);
      grad.addColorStop(0, `rgba(250, 204, 21, ${Math.min(1, 0.45 + intensity * 0.55)})`);
      grad.addColorStop(0.35, `rgba(249, 115, 22, ${intensity * 0.5})`);
      grad.addColorStop(0.7, `rgba(34, 197, 94, ${intensity * 0.3})`);
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.beginPath();
      ctx.arc(zone.cx, zone.cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Outer framing border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [gazePoints, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', ...style }}
    />
  );
}

function clusterPoints(points, radius) {
  const clusters = [];
  const visited = new Set();
  points.forEach((pt, i) => {
    if (visited.has(i)) return;
    const cluster = { cx: pt.x, cy: pt.y, count: 1 };
    points.forEach((pt2, j) => {
      if (i === j || visited.has(j)) return;
      if (Math.hypot(pt2.x - pt.x, pt2.y - pt.y) < radius) {
        cluster.cx = (cluster.cx * cluster.count + pt2.x) / (cluster.count + 1);
        cluster.cy = (cluster.cy * cluster.count + pt2.y) / (cluster.count + 1);
        cluster.count++;
        visited.add(j);
      }
    });
    visited.add(i);
    clusters.push(cluster);
  });
  return clusters.sort((a, b) => b.count - a.count).slice(0, 25);
}
