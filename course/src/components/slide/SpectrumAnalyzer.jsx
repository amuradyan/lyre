import { useEffect, useRef, useState } from 'react';
import spectrumData from '../../assets/a-sharp-3-spectrum.txt?raw';

const A_SHARP_3 = 233.08;

const getNoteFromFreq = (freq) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const a4 = 440;
  const semitones = 12 * Math.log2(freq / a4);
  const noteIndex = Math.round(semitones) + 9;
  const octave = Math.floor((noteIndex + 12 * 4) / 12);
  const note = notes[((noteIndex % 12) + 12) % 12];
  return `${note}${octave}`;
};

export default function SpectrumAnalyzer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [threshold, setThreshold] = useState(-45);
  const [maxFreq, setMaxFreq] = useState(8000);
  const [cursorX, setCursorX] = useState(null);

  const data = spectrumData.split('\n').map(line => {
    const [freq, level] = line.split('\t').map(Number);
    return { freq, level };
  });

  const filteredData = data.filter(d => d.freq <= maxFreq);

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
    const height = canvas.height;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const freqMin = 0;
    const freqMax = maxFreq;
    const levelMin = -70;
    const levelMax = -20;

    const xScale = (freq) => padding.left + (freq / freqMax) * chartWidth;
    const yScale = (level) => padding.top + chartHeight - ((level - levelMin) / (levelMax - levelMin)) * chartHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let level = levelMin; level <= levelMax; level += 10) {
      const y = yScale(level);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Nunito, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${level}dB`, padding.left - 10, y + 4);
    }

    for (let freq = 0; freq <= freqMax; freq += 1000) {
      const x = xScale(freq);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${freq / 1000}k`, x, height - padding.bottom + 20);
    }

    for (let i = 1; i <= 10; i++) {
      const harmonicFreq = A_SHARP_3 * i;
      if (harmonicFreq <= maxFreq) {
        const x = xScale(harmonicFreq);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const thresholdY = yScale(threshold);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, thresholdY);
    ctx.lineTo(width - padding.right, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < filteredData.length; i++) {
      const x = xScale(filteredData[i].freq);
      const y = yScale(filteredData[i].level);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    for (let i = 1; i < filteredData.length - 1; i++) {
      const curr = filteredData[i];
      const prev = filteredData[i - 1];
      const next = filteredData[i + 1];

      if (curr.level > prev.level && curr.level > next.level && curr.level > threshold) {
        const x = xScale(curr.freq);
        const y = yScale(curr.level);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (cursorX !== null && cursorX >= padding.left && cursorX <= width - padding.right) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cursorX, padding.top);
      ctx.lineTo(cursorX, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      const freq = ((cursorX - padding.left) / chartWidth) * freqMax;
      const nearestPoint = filteredData.reduce((nearest, point) => {
        const currDist = Math.abs(point.freq - freq);
        const nearestDist = Math.abs(nearest.freq - freq);
        return currDist < nearestDist ? point : nearest;
      }, filteredData[0]);

      if (nearestPoint) {
        const x = xScale(nearestPoint.freq);
        const y = yScale(nearestPoint.level);
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Frequency Spectrum - A#3 Lyre Harp', padding.left, 15);

  }, [threshold, maxFreq, cursorX, filteredData]);

  const getNearestPoint = () => {
    if (cursorX === null || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const padding = { left: 60, right: 40 };
    const chartWidth = width - padding.left - padding.right;

    if (cursorX < padding.left || cursorX > width - padding.right) return null;

    const freq = ((cursorX - padding.left) / chartWidth) * maxFreq;
    return filteredData.reduce((nearest, point) => {
      const currDist = Math.abs(point.freq - freq);
      const nearestDist = Math.abs(nearest.freq - freq);
      return currDist < nearestDist ? point : nearest;
    }, filteredData[0]);
  };

  const nearestPoint = getNearestPoint();

  return (
    <div ref={containerRef} className="my-6 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="threshold-slider" className="text-sm text-gray-700 whitespace-nowrap">
              Threshold:
            </label>
            <input
              id="threshold-slider"
              type="range"
              min="-70"
              max="-20"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span className="text-sm text-gray-600 w-12">{threshold}dB</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="maxfreq-slider" className="text-sm text-gray-700 whitespace-nowrap">
              Max Freq:
            </label>
            <input
              id="maxfreq-slider"
              type="range"
              min="2000"
              max="20000"
              step="1000"
              value={maxFreq}
              onChange={(e) => setMaxFreq(Number(e.target.value))}
              style={{ width: '120px' }}
            />
            <span className="text-sm text-gray-600 w-16">{(maxFreq / 1000).toFixed(0)}kHz</span>
          </div>
        </div>
        {nearestPoint && cursorX !== null && (
          <div className="text-sm text-gray-600">
            {getNoteFromFreq(nearestPoint.freq)} @ {nearestPoint.freq.toFixed(1)}Hz | {nearestPoint.level.toFixed(1)}dB
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        height={300}
        className="w-full bg-transparent"
        style={{ height: '300px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
