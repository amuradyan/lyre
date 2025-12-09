import { useEffect, useRef, useState } from 'react';

export default function HarmonicBuilder() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeHarmonics, setActiveHarmonics] = useState([
    true, false, false, false, false
  ]);
  const [cursorX, setCursorX] = useState(null);

  const toggleHarmonic = (index) => {
    setActiveHarmonics(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.offsetWidth;
    canvas.width = containerWidth;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;

    // Calculate number of sections and height
    const activeCount = activeHarmonics.filter(Boolean).length;
    const numberOfSections = activeCount + 1; // active harmonics + superposition
    const sectionHeight = 80;
    const totalHeight = numberOfSections * sectionHeight;

    canvas.height = totalHeight;

    ctx.clearRect(0, 0, width, totalHeight);

    const baseAmplitude = sectionHeight * 0.24;
    const baseFrequency = 4;

    // Draw each active harmonic in its own section
    let currentSection = 0;
    activeHarmonics.forEach((active, index) => {
      if (active) {
        const harmonicNumber = index + 1;
        const yOffset = currentSection * sectionHeight;
        const centerY = yOffset + sectionHeight / 2;

        // Draw center line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Nunito, sans-serif';
        const label = harmonicNumber === 1 ? 'f' : `${harmonicNumber - 1}${getOrdinalSuffix(harmonicNumber - 1)} (${harmonicNumber}f)`;
        ctx.fillText(label, 10, yOffset + 25);

        // Draw harmonic wave
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const t = (x / width) * Math.PI * 2 * baseFrequency * harmonicNumber;
          const amplitude = baseAmplitude / harmonicNumber;
          const y = centerY + amplitude * Math.sin(t);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        currentSection++;
      }
    });

    // Draw superposition section
    const superpositionYOffset = currentSection * sectionHeight;
    const superpositionCenterY = superpositionYOffset + sectionHeight / 2;

    // Draw center line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, superpositionCenterY);
    ctx.lineTo(width, superpositionCenterY);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillText('Superposition', 10, superpositionYOffset + 25);

    // Draw superposition waveform
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      let sum = 0;

      activeHarmonics.forEach((active, index) => {
        if (active) {
          const harmonicNumber = index + 1;
          const t = (x / width) * Math.PI * 2 * baseFrequency * harmonicNumber;
          const amplitude = baseAmplitude / harmonicNumber;
          sum += amplitude * Math.sin(t);
        }
      });

      const y = superpositionCenterY + sum;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw cursor line and amplitude bars
    if (cursorX !== null && cursorX >= 0 && cursorX <= width) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, totalHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawAmplitude = (centerY, waveY, color) => {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cursorX, centerY);
        ctx.lineTo(cursorX, centerY + waveY);
        ctx.stroke();
      };

      // Draw amplitude bars for each active harmonic
      let currentSection = 0;
      activeHarmonics.forEach((active, index) => {
        if (active) {
          const harmonicNumber = index + 1;
          const yOffset = currentSection * sectionHeight;
          const centerY = yOffset + sectionHeight / 2;
          const t = (cursorX / width) * Math.PI * 2 * baseFrequency * harmonicNumber;
          const amplitude = baseAmplitude / harmonicNumber;
          const waveY = amplitude * Math.sin(t);

          drawAmplitude(centerY, waveY, '#9ca3af');
          currentSection++;
        }
      });

      // Draw amplitude bar for superposition
      const superpositionYOffset = currentSection * sectionHeight;
      const superpositionCenterY = superpositionYOffset + sectionHeight / 2;
      let sumY = 0;

      activeHarmonics.forEach((active, index) => {
        if (active) {
          const harmonicNumber = index + 1;
          const t = (cursorX / width) * Math.PI * 2 * baseFrequency * harmonicNumber;
          const amplitude = baseAmplitude / harmonicNumber;
          sumY += amplitude * Math.sin(t);
        }
      });

      drawAmplitude(superpositionCenterY, sumY, '#374151');
    }

  }, [activeHarmonics, cursorX]);

  const activeCount = activeHarmonics.filter(Boolean).length;
  const canvasHeight = (activeCount + 1) * 80;

  return (
    <div ref={containerRef} className="my-6 w-full">
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {activeHarmonics.map((active, index) => {
          const harmonicNumber = index + 1;
          const frequency = `${harmonicNumber}f`;
          const label = harmonicNumber === 1 ? 'Fundamental' : `${harmonicNumber - 1}${getOrdinalSuffix(harmonicNumber - 1)}`;

          return (
            <button
              key={index}
              onClick={() => toggleHarmonic(index)}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{
                backgroundColor: active ? '#B187D8' : '#e5e7eb',
                color: active ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif'
              }}
            >
              {label} /{frequency}/
            </button>
          );
        })}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full bg-transparent"
        style={{ height: `${canvasHeight}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

    </div>
  );
}

function getOrdinalSuffix(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
