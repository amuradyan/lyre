import { useEffect, useRef, useState } from 'react';
import PlayIcon from '../icons/PlayIcon.jsx';
import PauseIcon from '../icons/PauseIcon.jsx';
import EraserIcon from '../icons/EraserIcon.jsx';

function AudioPlayerButton({ src }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (!src) return null;

  return (
    <>
      {isPlaying ? (
        <PauseIcon
          color="rgb(192, 132, 252)"
          size={28}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          onClick={togglePlay}
          title="Pause audio"
        />
      ) : (
        <PlayIcon
          color="rgb(192, 132, 252)"
          size={28}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          onClick={togglePlay}
          title="Play audio"
        />
      )}
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        preload="auto"
      />
    </>
  );
}

const getNoteFromFreq = (freq) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const a4 = 440;
  const semitones = 12 * Math.log2(freq / a4);
  const noteIndex = Math.round(semitones) + 9;
  const octave = Math.floor((noteIndex + 12 * 4) / 12);
  const note = notes[((noteIndex % 12) + 12) % 12];
  return `${note}${octave}`;
};

const interpolateData = (data, pointsPerInterval = 3) => {
  const interpolated = [];

  for (let i = 0; i < data.length - 1; i++) {
    const p1 = data[i];
    const p2 = data[i + 1];

    interpolated.push(p1);

    for (let j = 1; j <= pointsPerInterval; j++) {
      const t = j / (pointsPerInterval + 1);
      const freq = p1.freq + (p2.freq - p1.freq) * t;
      const level = p1.level + (p2.level - p1.level) * t;
      interpolated.push({ freq, level });
    }
  }

  interpolated.push(data[data.length - 1]);
  return interpolated;
};

export default function SpectrumAnalyzer({ audioSrc }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [threshold, setThreshold] = useState(-45);
  const [rangeWidth, setRangeWidth] = useState(8000);
  const [scrollPos, setScrollPos] = useState(0);
  const [cursorX, setCursorX] = useState(null);
  const [cursorY, setCursorY] = useState(null);
  const [frozenGroups, setFrozenGroups] = useState([]);
  const [spectrumData, setSpectrumData] = useState('');

  const minFreq = scrollPos;
  const maxFreq = scrollPos + rangeWidth;

  useEffect(() => {
    fetch('/a-sharp-3-spectrum.txt')
      .then(response => response.text())
      .then(data => setSpectrumData(data))
      .catch(error => console.error('Error loading spectrum data:', error));
  }, []);

  const rawData = !spectrumData ? [] : spectrumData.split('\n')
    .map(line => {
      const [freq, level] = line.split('\t').map(Number);
      return { freq, level };
    })
    .filter(d => !isNaN(d.freq) && !isNaN(d.level) && d.freq !== undefined && d.level !== undefined);

  const data = rawData.length > 0 ? interpolateData(rawData, 10) : [];

  const filteredData = data.filter(d => d && d.freq >= minFreq && d.freq <= maxFreq);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorX(x);
    setCursorY(y);
  };

  const handleMouseLeave = () => {
    setCursorX(null);
    setCursorY(null);
  };

  const getNearestPoint = () => {
    if (cursorX === null || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const padding = { left: 60, right: 40 };
    const chartWidth = width - padding.left - padding.right;

    if (cursorX < padding.left || cursorX > width - padding.right) return null;
    if (filteredData.length === 0) return null;

    const freq = minFreq + ((cursorX - padding.left) / chartWidth) * (maxFreq - minFreq);
    return filteredData.reduce((nearest, point) => {
      const currDist = Math.abs(point.freq - freq);
      const nearestDist = Math.abs(nearest.freq - freq);
      return currDist < nearestDist ? point : nearest;
    }, filteredData[0]);
  };

  const groupColors = [
    '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7',
    '#06b6d4', '#84cc16', '#ec4899', '#10b981', '#f97316'
  ];

  const handleClick = () => {
    if (cursorX === null || cursorY === null || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const levelMin = -70;
    const levelMax = -20;
    const xScale = (freq) => padding.left + ((freq - minFreq) / (maxFreq - minFreq)) * chartWidth;
    const yScale = (level) => padding.top + chartHeight - ((level - levelMin) / (levelMax - levelMin)) * chartHeight;

    let clickedGroupIndex = -1;
    for (let i = 0; i < frozenGroups.length; i++) {
      const group = frozenGroups[i];
      const dotX = xScale(group.freq);
      const dotY = yScale(group.level);
      const distance = Math.sqrt(Math.pow(cursorX - dotX, 2) + Math.pow(cursorY - dotY, 2));

      if (distance <= 8) {
        clickedGroupIndex = i;
        break;
      }
    }

    if (clickedGroupIndex >= 0) {
      setFrozenGroups(frozenGroups.filter((_, i) => i !== clickedGroupIndex));
    } else {
      const nearestPoint = getNearestPoint();
      if (nearestPoint) {
        const usedColors = new Set(frozenGroups.map(g => g.color));
        const availableColor = groupColors.find(c => !usedColors.has(c)) || groupColors[frozenGroups.length % groupColors.length];
        setFrozenGroups([...frozenGroups, { ...nearestPoint, color: availableColor }]);
      }
    }
  };

  const handleClearAll = () => {
    setFrozenGroups([]);
  };

  const handleWheel = (e) => {
    if (rangeWidth >= 20000) return;

    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    const step = 100;
    const newPos = Math.max(0, Math.min(20000 - rangeWidth, scrollPos + (delta > 0 ? step : -step)));
    setScrollPos(newPos);
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

    const freqMin = minFreq;
    const freqMax = maxFreq;
    const levelMin = -70;
    const levelMax = -20;

    const xScale = (freq) => padding.left + ((freq - freqMin) / (freqMax - freqMin)) * chartWidth;
    const yScale = (level) => padding.top + chartHeight - ((level - levelMin) / (levelMax - levelMin)) * chartHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
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

    const freqStep = (freqMax - freqMin) > 10000 ? 2000 : (freqMax - freqMin) > 4000 ? 1000 : 500;
    const startFreq = Math.ceil(freqMin / freqStep) * freqStep;
    for (let freq = startFreq; freq <= freqMax; freq += freqStep) {
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

    const thresholdY = yScale(threshold);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, thresholdY);
    ctx.lineTo(width - padding.right, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${threshold}dB`, width - padding.right + 5, thresholdY + 4);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;
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

    const drawHarmonics = (point, groupColor, isFrozen, showLabels) => {
      const fundamentalFreq = point.freq;
      const x = xScale(point.freq);
      const y = yScale(point.level);

      ctx.fillStyle = groupColor || 'rgba(99, 102, 241, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, isFrozen ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();

      if (isFrozen && showLabels) {
        ctx.fillStyle = groupColor;
        ctx.font = 'bold 11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(getNoteFromFreq(fundamentalFreq), x, padding.top - 5);
      }

      for (let octave = 1; octave <= 15; octave++) {
        const harmonicFreq = fundamentalFreq * Math.pow(2, octave);
        if (harmonicFreq > maxFreq) break;
        if (harmonicFreq < minFreq) continue;

        const hx = xScale(harmonicFreq);
        const lineHeight = 30;
        ctx.strokeStyle = groupColor || 'rgba(156, 163, 175, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(hx, padding.top);
        ctx.lineTo(hx, padding.top + lineHeight);
        ctx.stroke();

        if (isFrozen && showLabels) {
          const note = getNoteFromFreq(harmonicFreq);
          ctx.fillStyle = groupColor;
          ctx.font = 'bold 11px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(note, hx, padding.top - 5);
        }
      }
    };

    frozenGroups.forEach((group) => {
      if (group.freq >= minFreq && group.freq <= maxFreq) {
        let showLabels = false;
        if (cursorX !== null && cursorY !== null) {
          const dotX = xScale(group.freq);
          const dotY = yScale(group.level);
          const distance = Math.sqrt(Math.pow(cursorX - dotX, 2) + Math.pow(cursorY - dotY, 2));

          if (distance <= 8) {
            showLabels = true;
          } else {
            for (let octave = 1; octave <= 15; octave++) {
              const harmonicFreq = group.freq * Math.pow(2, octave);
              if (harmonicFreq > maxFreq) break;
              if (harmonicFreq < minFreq) continue;
              const harmonicX = xScale(harmonicFreq);
              if (Math.abs(cursorX - harmonicX) <= 5) {
                showLabels = true;
                break;
              }
            }
          }
        }

        drawHarmonics(group, group.color, true, showLabels);
      }
    });

    if (cursorX !== null && cursorX >= padding.left && cursorX <= width - padding.right) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cursorX, padding.top);
      ctx.lineTo(cursorX, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      const freq = freqMin + ((cursorX - padding.left) / chartWidth) * (freqMax - freqMin);
      const nearestPoint = filteredData.reduce((nearest, point) => {
        const currDist = Math.abs(point.freq - freq);
        const nearestDist = Math.abs(nearest.freq - freq);
        return currDist < nearestDist ? point : nearest;
      }, filteredData[0]);

      if (nearestPoint) {
        const isFrozen = frozenGroups.some(g => Math.abs(g.freq - nearestPoint.freq) < 10);
        if (!isFrozen) {
          drawHarmonics(nearestPoint, 'rgba(156, 163, 175, 0.6)', false, false);
        }
      }
    }

    if (cursorY !== null && cursorY >= padding.top && cursorY <= height - padding.bottom) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, cursorY);
      ctx.lineTo(width - padding.right, cursorY);
      ctx.stroke();
      ctx.setLineDash([]);

      const cursorLevel = levelMin + ((padding.top + chartHeight - cursorY) / chartHeight) * (levelMax - levelMin);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Nunito, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.round(cursorLevel)}dB`, width - padding.right + 5, cursorY + 4);
    }
  }, [threshold, rangeWidth, scrollPos, cursorX, cursorY, filteredData, frozenGroups, minFreq, maxFreq]);

  const nearestPoint = getNearestPoint();

  return (
    <div ref={containerRef} className="my-6 w-full">
      <style jsx>{`
        .threshold-slider,
        .range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 120px;
          height: 2px;
          background: #d1d5db;
          outline: none;
          border-radius: 1px;
        }
        .threshold-slider::-webkit-slider-track,
        .range-slider::-webkit-slider-track {
          width: 100%;
          height: 2px;
          background: #d1d5db;
          border: none;
        }
        .threshold-slider::-moz-range-track,
        .range-slider::-moz-range-track {
          width: 100%;
          height: 2px;
          background: #d1d5db;
          border: none;
        }
        .threshold-slider::-webkit-slider-thumb,
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 16px;
          background: rgb(192, 132, 252);
          cursor: pointer;
          border-radius: 2px;
        }
        .threshold-slider::-moz-range-thumb,
        .range-slider::-moz-range-thumb {
          width: 24px;
          height: 16px;
          background: rgb(192, 132, 252);
          cursor: pointer;
          border-radius: 2px;
          border: none;
        }
      `}</style>
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
              className="threshold-slider"
            />
            <span className="text-sm text-gray-600 w-12">{threshold}dB</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="range-slider" className="text-sm text-gray-700 whitespace-nowrap">
              Range:
            </label>
            <input
              id="range-slider"
              type="range"
              min="2000"
              max="20000"
              step="1000"
              value={rangeWidth}
              onChange={(e) => {
                const newRange = Number(e.target.value);
                setRangeWidth(newRange);
                if (scrollPos + newRange > 20000) {
                  setScrollPos(Math.max(0, 20000 - newRange));
                }
              }}
              className="range-slider"
            />
            <span className="text-sm text-gray-600 w-16">{(rangeWidth / 1000).toFixed(0)}kHz</span>
          </div>
          <div className="flex items-center gap-2">
            <AudioPlayerButton src={audioSrc} />
            <EraserIcon
              color={frozenGroups.length === 0 ? '#9ca3af' : 'rgb(192, 132, 252)'}
              size={28}
              onClick={handleClearAll}
              className={frozenGroups.length === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-70 transition-opacity'}
              title="Clear all markers"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {nearestPoint && cursorX !== null && nearestPoint.freq !== undefined && nearestPoint.level !== undefined && (
            <div className="text-sm text-gray-600">
              {getNoteFromFreq(nearestPoint.freq)} @ {nearestPoint.freq.toFixed(1)}Hz | {nearestPoint.level.toFixed(1)}dB
            </div>
          )}
        </div>
      </div>
      <div className="relative" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          height={300}
          className="w-full bg-transparent cursor-pointer"
          style={{ height: '300px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
        {rangeWidth < 20000 && (
          <div
            className="absolute"
            style={{
              left: '60px',
              right: '40px',
              bottom: '45px',
              height: '8px'
            }}
          >
            <input
              type="range"
              min="0"
              max={20000 - rangeWidth}
              step="50"
              value={scrollPos}
              onChange={(e) => setScrollPos(Number(e.target.value))}
              className="scrollbar-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                height: '6px',
                outline: 'none',
                opacity: 0.8
              }}
              title={`Viewing ${(minFreq / 1000).toFixed(1)}-${(maxFreq / 1000).toFixed(1)}kHz`}
            />
            <style jsx>{`
              .scrollbar-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 120px;
                height: 6px;
                background: rgb(192, 132, 252);
                cursor: pointer;
                border-radius: 3px;
              }
              .scrollbar-slider::-moz-range-thumb {
                width: 120px;
                height: 6px;
                background: rgb(192, 132, 252);
                cursor: pointer;
                border-radius: 3px;
                border: none;
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
