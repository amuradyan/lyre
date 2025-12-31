import { useEffect, useRef, useState } from 'react';

export default function SineWaveVisualizer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [angle, setAngle] = useState(Math.PI / 9);
  const [dragging, setDragging] = useState(null);
  const [hovering, setHovering] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.offsetWidth;
    canvas.width = containerWidth;
    canvas.height = 300;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const circleRadius = 80;
    const circleCenterX = padding.left + circleRadius + 20;
    const circleCenterY = height / 2;

    const waveStartX = circleCenterX + circleRadius + 60;
    const waveWidth = width - waveStartX - padding.right;
    const waveAmplitude = 80;
    const waveCenterY = height / 2;

    // Draw unit circle
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw circle axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(circleCenterX - circleRadius - 10, circleCenterY);
    ctx.lineTo(circleCenterX + circleRadius + 10, circleCenterY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(circleCenterX, circleCenterY - circleRadius - 10);
    ctx.lineTo(circleCenterX, circleCenterY + circleRadius + 10);
    ctx.stroke();

    // Draw angle markers on circle
    const markers = [
      { angle: 0, label: '0' },
      { angle: Math.PI / 2, label: 'π/2' },
      { angle: Math.PI, label: 'π' },
      { angle: 3 * Math.PI / 2, label: '3π/2' }
    ];

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Nunito, sans-serif';
    markers.forEach(({ angle: a, label }) => {
      const x = circleCenterX + Math.cos(a) * (circleRadius + 20);
      const y = circleCenterY - Math.sin(a) * (circleRadius + 20);
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + 4);
    });

    // Draw rotating point on circle
    const pointX = circleCenterX + Math.cos(angle) * circleRadius;
    const pointY = circleCenterY - Math.sin(angle) * circleRadius;

    const circlePointRadius = (hovering === 'circle' || dragging === 'circle') ? 8 : 6;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(pointX, pointY, circlePointRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw radius line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circleCenterX, circleCenterY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();

    // Draw wave axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(waveStartX, waveCenterY);
    ctx.lineTo(waveStartX + waveWidth, waveCenterY);
    ctx.stroke();

    // Draw wave x-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const xLabels = [
      { pos: 0, label: '0' },
      { pos: 0.25, label: 'π/2' },
      { pos: 0.5, label: 'π' },
      { pos: 0.75, label: '3π/2' },
      { pos: 1, label: '2π' }
    ];
    xLabels.forEach(({ pos, label }) => {
      const x = waveStartX + pos * waveWidth;
      ctx.fillText(label, x, waveCenterY + 25);
    });

    // Draw wave y-axis labels
    ctx.textAlign = 'right';
    ctx.fillText('1', waveStartX - 10, waveCenterY - waveAmplitude + 4);
    ctx.fillText('-1', waveStartX - 10, waveCenterY + waveAmplitude + 4);
    ctx.fillText('0', waveStartX - 10, waveCenterY + 4);

    // Draw sine wave up to current angle
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steps = 200;
    const maxAngle = Math.min(angle, Math.PI * 2);
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxAngle;
      const x = waveStartX + (t / (Math.PI * 2)) * waveWidth;
      const y = waveCenterY - Math.sin(t) * waveAmplitude;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw current point on wave
    const currentWaveX = waveStartX + (angle / (Math.PI * 2)) * waveWidth;
    const currentWaveY = waveCenterY - Math.sin(angle) * waveAmplitude;

    const wavePointRadius = (hovering === 'wave' || dragging === 'wave') ? 8 : 6;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(currentWaveX, currentWaveY, wavePointRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw horizontal dashed line from circle point to wave
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(currentWaveX, currentWaveY);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [angle, hovering, dragging]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const circleRadius = 80;
    const circleCenterX = padding.left + circleRadius + 20;
    const circleCenterY = height / 2;
    const waveStartX = circleCenterX + circleRadius + 60;
    const waveWidth = width - waveStartX - padding.right;
    const waveAmplitude = 80;
    const waveCenterY = height / 2;

    const pointX = circleCenterX + Math.cos(angle) * circleRadius;
    const pointY = circleCenterY - Math.sin(angle) * circleRadius;
    const currentWaveX = waveStartX + (angle / (Math.PI * 2)) * waveWidth;
    const currentWaveY = waveCenterY - Math.sin(angle) * waveAmplitude;

    const distToCircle = Math.sqrt(Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2));
    const distToWave = Math.sqrt(Math.pow(mouseX - currentWaveX, 2) + Math.pow(mouseY - currentWaveY, 2));

    if (distToCircle <= 10) {
      setDragging('circle');
    } else if (distToWave <= 10) {
      setDragging('wave');
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const circleRadius = 80;
    const circleCenterX = padding.left + circleRadius + 20;
    const circleCenterY = height / 2;
    const waveStartX = circleCenterX + circleRadius + 60;
    const waveWidth = width - waveStartX - padding.right;
    const waveAmplitude = 80;
    const waveCenterY = height / 2;

    if (dragging === 'circle') {
      const dx = mouseX - circleCenterX;
      const dy = circleCenterY - mouseY;
      let newAngle = Math.atan2(dy, dx);
      if (newAngle < 0) newAngle += Math.PI * 2;
      setAngle(newAngle);
    } else if (dragging === 'wave') {
      const relativeX = Math.max(0, Math.min(waveWidth, mouseX - waveStartX));
      const newAngle = (relativeX / waveWidth) * Math.PI * 2;
      setAngle(newAngle);
    } else {
      const pointX = circleCenterX + Math.cos(angle) * circleRadius;
      const pointY = circleCenterY - Math.sin(angle) * circleRadius;
      const currentWaveX = waveStartX + (angle / (Math.PI * 2)) * waveWidth;
      const currentWaveY = waveCenterY - Math.sin(angle) * waveAmplitude;

      const distToCircle = Math.sqrt(Math.pow(mouseX - pointX, 2) + Math.pow(mouseY - pointY, 2));
      const distToWave = Math.sqrt(Math.pow(mouseX - currentWaveX, 2) + Math.pow(mouseY - currentWaveY, 2));

      if (distToCircle <= 10) {
        setHovering('circle');
      } else if (distToWave <= 10) {
        setHovering('wave');
      } else {
        setHovering(null);
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleMouseLeave = () => {
    setDragging(null);
    setHovering(null);
  };

  return (
    <div ref={containerRef} className="my-6 w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: hovering || dragging ? 'pointer' : 'default' }}
      />
    </div>
  );
}
