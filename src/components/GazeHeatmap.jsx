import { useRef, useEffect } from 'react';

/**
 * GazeHeatmap — renders a canvas heatmap of gaze fixation points.
 * Uses a gaussian kernel for each point in a diagnostic monitor frame.
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

    // Draw gaussian blobs per point
    gazePoints.forEach((pt) => {
      const x = (pt.x / window.innerWidth) * width;
      const y = (pt.y / window.innerHeight) * height;
      const r = 26;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.22)');
      grad.addColorStop(0.5, 'rgba(34, 197, 94, 0.08)');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Highlight hot zones with brighter emerald & lime
    const hotZones = clusterPoints(gazePoints, 35);
    hotZones.forEach((zone) => {
      const x = (zone.cx / window.innerWidth) * width;
      const y = (zone.cy / window.innerHeight) * height;
      const intensity = Math.min(zone.count / 25, 1);
      const r = 16 + intensity * 22;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(163, 230, 53, ${intensity * 0.95})`);
      grad.addColorStop(0.4, `rgba(34, 197, 94, ${intensity * 0.5})`);
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Outer framing border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [gazePoints, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', ...style }}
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
