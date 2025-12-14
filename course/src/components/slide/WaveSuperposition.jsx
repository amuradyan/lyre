import { useEffect, useRef, useState } from 'react';

export default function WaveSuperposition() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(1);
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

    const drawWave = (yOffset, color, phaseShift = 0, freqMultiplier = 1, ampMultiplier = 1) => {
      const baseAmplitude = sectionHeight * 0.24;
      const baseFrequency = 2;
      const centerY = yOffset + sectionHeight / 2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * baseFrequency * freqMultiplier;
        const y = centerY + baseAmplitude * ampMultiplier * Math.sin(t + phaseShift);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    const drawSuperposition = (yOffset) => {
      const baseAmplitude = sectionHeight * 0.24;
      const baseFrequency = 2;
      const centerY = yOffset + sectionHeight / 2;

      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t1 = (x / width) * Math.PI * 2 * baseFrequency;
        const t2 = (x / width) * Math.PI * 2 * baseFrequency * frequency;
        const wave1 = baseAmplitude * Math.sin(t1);
        const wave2 = baseAmplitude * amplitude * Math.sin(t2 + phase);
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

    drawWave(0, '#9ca3af', 0, 1, 1);
    drawWave(sectionHeight, '#9ca3af', phase, frequency, amplitude);
    drawSuperposition(sectionHeight * 2);

    if (cursorX !== null && cursorX >= 0 && cursorX <= width) {
      const baseAmplitude = sectionHeight * 0.24;
      const baseFrequency = 2;

      const t1 = (cursorX / width) * Math.PI * 2 * baseFrequency;
      const t2 = (cursorX / width) * Math.PI * 2 * baseFrequency * frequency;
      const wave1Y = baseAmplitude * Math.sin(t1);
      const wave2Y = baseAmplitude * amplitude * Math.sin(t2 + phase);
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

  }, [phase, frequency, amplitude, cursorX]);

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
        style={{ height: '200px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div className="mt-4 flex items-center justify-center gap-6">
        <span className="text-sm text-gray-700">Wave 2:</span>
        <div className="flex items-center gap-2">
          <label htmlFor="phase-slider" className="text-sm text-gray-700 whitespace-nowrap">
            Phase:
          </label>
          <input
            id="phase-slider"
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.01"
            value={phase}
            onChange={(e) => setPhase(parseFloat(e.target.value))}
            style={{ width: '120px' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="frequency-slider" className="text-sm text-gray-700 whitespace-nowrap">
            Frequency:
          </label>
          <input
            id="frequency-slider"
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            style={{ width: '120px' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="amplitude-slider" className="text-sm text-gray-700 whitespace-nowrap">
            Amplitude:
          </label>
          <input
            id="amplitude-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            style={{ width: '120px' }}
          />
        </div>
      </div>
    </div>
  );
}
