import { useEffect, useRef, useState } from 'react';

export default function WaveSuperposition() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [cursorX, setCursorX] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.offsetWidth;
    canvas.width = containerWidth;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const sectionHeight = height / 3;

    ctx.clearRect(0, 0, width, height);

    const drawWave = (yOffset, color, phaseShift = 0) => {
      const amplitude = sectionHeight * 0.24;
      const frequency = 2;
      const centerY = yOffset + sectionHeight / 2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * frequency;
        const y = centerY + amplitude * Math.sin(t + phaseShift);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    const drawSuperposition = (yOffset) => {
      const amplitude = sectionHeight * 0.24;
      const frequency = 2;
      const centerY = yOffset + sectionHeight / 2;

      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * frequency;
        const wave1 = amplitude * Math.sin(t);
        const wave2 = amplitude * Math.sin(t + phase);
        const sum = wave1 + wave2;
        const y = centerY + sum;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, sectionHeight / 2);
    ctx.lineTo(width, sectionHeight / 2);
    ctx.moveTo(0, sectionHeight + sectionHeight / 2);
    ctx.lineTo(width, sectionHeight + sectionHeight / 2);
    ctx.moveTo(0, sectionHeight * 2 + sectionHeight / 2);
    ctx.lineTo(width, sectionHeight * 2 + sectionHeight / 2);
    ctx.stroke();

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillText('Wave 1', 10, 25);
    ctx.fillText('Wave 2', 10, sectionHeight + 25);
    ctx.fillText('Superposition', 10, sectionHeight * 2 + 25);

    drawWave(0, '#9ca3af', 0);
    drawWave(sectionHeight, '#9ca3af', phase);
    drawSuperposition(sectionHeight * 2);

    if (cursorX !== null && cursorX >= 0 && cursorX <= width) {
      const amplitude = sectionHeight * 0.24;
      const frequency = 2;

      const t = (cursorX / width) * Math.PI * 2 * frequency;
      const wave1Y = amplitude * Math.sin(t);
      const wave2Y = amplitude * Math.sin(t + phase);
      const sumY = wave1Y + wave2Y;

      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawAmplitude = (centerY, waveY) => {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cursorX, centerY);
        ctx.lineTo(cursorX, centerY + waveY);
        ctx.stroke();
      };

      drawAmplitude(sectionHeight / 2, wave1Y);
      drawAmplitude(sectionHeight + sectionHeight / 2, wave2Y);
      drawAmplitude(sectionHeight * 2 + sectionHeight / 2, sumY);

      const drawDot = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      };

      drawDot(cursorX, sectionHeight / 2 + wave1Y, '#9ca3af');
      drawDot(cursorX, sectionHeight + sectionHeight / 2 + wave2Y, '#9ca3af');
      drawDot(cursorX, sectionHeight * 2 + sectionHeight / 2 + sumY, '#374151');
    }

  }, [phase, cursorX]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCursorX(x);
  };

  const handleMouseLeave = () => {
    setCursorX(null);
  };

  return (
    <div ref={containerRef} className="my-6 w-full">
      <canvas
        ref={canvasRef}
        height={200}
        className="w-full bg-transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div className="mt-4 flex items-center justify-center gap-4">
        <label htmlFor="phase-slider" className="text-sm text-gray-700">
          Phase shift:
        </label>
        <input
          id="phase-slider"
          type="range"
          min="0"
          max={Math.PI * 2}
          step="0.01"
          value={phase}
          onChange={(e) => setPhase(parseFloat(e.target.value))}
          className="w-1/2"
        />
        {/* <span className="text-sm text-gray-600 font-mono w-20">
          {(phase / Math.PI).toFixed(2)}π
        </span> */}
      </div>
    </div>
  );
}
