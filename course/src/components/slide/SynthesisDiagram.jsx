import { useEffect, useRef, useState } from 'react';

const oscillators = [
  { name: 'OSC 1', freq: 233, amp: 100, color: '#22c55e' },
  { name: 'OSC 2', freq: 466, amp: 50, color: '#ef4444' },
  { name: 'OSC 4', freq: 932, amp: 92, color: '#3b82f6' },
  { name: 'OSC 8', freq: 1864, amp: 81, color: '#f59e0b' },
  { name: 'OSC 18', freq: 4196, amp: 93, color: '#a855f7' }
];

export default function SynthesisDiagram() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [highlightedStage, setHighlightedStage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = 900;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const oscWidth = 70;
    const oscHeight = 45;
    const stageWidth = 100;
    const stageHeight = 70;
    const spacing = 30;
    const startX = 20;

    let currentX = startX;

    oscillators.forEach((osc, index) => {
      const y = 50 + index * (oscHeight + 8);
      const isHighlighted = highlightedStage === `osc-${index}`;

      ctx.strokeStyle = isHighlighted ? osc.color : '#d1d5db';
      ctx.fillStyle = isHighlighted ? `${osc.color}20` : '#ffffff';
      ctx.lineWidth = isHighlighted ? 2.5 : 1;
      ctx.beginPath();
      ctx.roundRect(currentX, y, oscWidth, oscHeight, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHighlighted ? osc.color : '#374151';
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(osc.name, currentX + oscWidth / 2, y + 16);
      ctx.font = '9px Nunito, sans-serif';
      ctx.fillText(`${osc.freq} Hz`, currentX + oscWidth / 2, y + 28);
      ctx.fillText(`${osc.amp}%`, currentX + oscWidth / 2, y + 38);

      const arrowStartX = currentX + oscWidth;
      const arrowY = y + oscHeight / 2;
      ctx.strokeStyle = isHighlighted ? osc.color : '#9ca3af';
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(startX + oscWidth + spacing, arrowY);
      ctx.stroke();
    });

    currentX = startX + oscWidth + spacing;

    const mixerX = currentX;
    const mixerY = 140;
    const isHighlightedMixer = highlightedStage === 'mixer';
    ctx.strokeStyle = isHighlightedMixer ? '#6366f1' : '#d1d5db';
    ctx.fillStyle = isHighlightedMixer ? '#6366f120' : '#ffffff';
    ctx.lineWidth = isHighlightedMixer ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(mixerX, mixerY, stageWidth, stageHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHighlightedMixer ? '#6366f1' : '#374151';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MIXER', mixerX + stageWidth / 2, mixerY + 32);
    ctx.font = '9px Nunito, sans-serif';
    ctx.fillText('Sum all OSC', mixerX + stageWidth / 2, mixerY + 50);

    ctx.strokeStyle = isHighlightedMixer ? '#6366f1' : '#9ca3af';
    ctx.lineWidth = isHighlightedMixer ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(mixerX + stageWidth, mixerY + stageHeight / 2);
    ctx.lineTo(mixerX + stageWidth + spacing, mixerY + stageHeight / 2);
    ctx.stroke();

    currentX = mixerX + stageWidth + spacing;

    const filterX = currentX;
    const filterY = 140;
    const isHighlightedFilter = highlightedStage === 'filters';
    ctx.strokeStyle = isHighlightedFilter ? '#10b981' : '#d1d5db';
    ctx.fillStyle = isHighlightedFilter ? '#10b98120' : '#ffffff';
    ctx.lineWidth = isHighlightedFilter ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(filterX, filterY, stageWidth, stageHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHighlightedFilter ? '#10b981' : '#374151';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FILTERS', filterX + stageWidth / 2, filterY + 26);
    ctx.font = '9px Nunito, sans-serif';
    ctx.fillText('Low-pass', filterX + stageWidth / 2, filterY + 42);
    ctx.fillText('Resonances', filterX + stageWidth / 2, filterY + 54);

    ctx.strokeStyle = isHighlightedFilter ? '#10b981' : '#9ca3af';
    ctx.lineWidth = isHighlightedFilter ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(filterX + stageWidth, filterY + stageHeight / 2);
    ctx.lineTo(filterX + stageWidth + spacing, filterY + stageHeight / 2);
    ctx.stroke();

    currentX = filterX + stageWidth + spacing;

    const adsrX = currentX;
    const adsrY = 140;
    const isHighlightedADSR = highlightedStage === 'adsr';
    ctx.strokeStyle = isHighlightedADSR ? '#f59e0b' : '#d1d5db';
    ctx.fillStyle = isHighlightedADSR ? '#f59e0b20' : '#ffffff';
    ctx.lineWidth = isHighlightedADSR ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(adsrX, adsrY, stageWidth, stageHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHighlightedADSR ? '#f59e0b' : '#374151';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADSR', adsrX + stageWidth / 2, adsrY + 28);
    ctx.font = '9px Nunito, sans-serif';
    ctx.fillText('Amplitude', adsrX + stageWidth / 2, adsrY + 44);
    ctx.fillText('envelope', adsrX + stageWidth / 2, adsrY + 56);

    ctx.strokeStyle = isHighlightedADSR ? '#f59e0b' : '#9ca3af';
    ctx.lineWidth = isHighlightedADSR ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(adsrX + stageWidth, adsrY + stageHeight / 2);
    ctx.lineTo(adsrX + stageWidth + spacing, adsrY + stageHeight / 2);
    ctx.stroke();

    currentX = adsrX + stageWidth + spacing;

    const filterEnvX = currentX;
    const filterEnvY = 140;
    const isHighlightedFilterEnv = highlightedStage === 'filter-envelope';
    ctx.strokeStyle = isHighlightedFilterEnv ? '#8b5cf6' : '#d1d5db';
    ctx.fillStyle = isHighlightedFilterEnv ? '#8b5cf620' : '#ffffff';
    ctx.lineWidth = isHighlightedFilterEnv ? 2.5 : 1;
    ctx.beginPath();
    ctx.roundRect(filterEnvX, filterEnvY, stageWidth, stageHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHighlightedFilterEnv ? '#8b5cf6' : '#374151';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FILTER ENV', filterEnvX + stageWidth / 2, filterEnvY + 28);
    ctx.font = '9px Nunito, sans-serif';
    ctx.fillText('Cutoff', filterEnvX + stageWidth / 2, filterEnvY + 44);
    ctx.fillText('envelope', filterEnvX + stageWidth / 2, filterEnvY + 56);

    ctx.strokeStyle = isHighlightedFilterEnv ? '#8b5cf6' : '#9ca3af';
    ctx.lineWidth = isHighlightedFilterEnv ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(filterEnvX + stageWidth, filterEnvY + stageHeight / 2);
    ctx.lineTo(filterEnvX + stageWidth + spacing, filterEnvY + stageHeight / 2);
    ctx.stroke();

    currentX = filterEnvX + stageWidth + spacing;

    const outputX = currentX;
    const outputY = 155;
    const outputSize = 40;
    const isHighlightedOutput = highlightedStage === 'output';
    ctx.strokeStyle = isHighlightedOutput ? '#ef4444' : '#d1d5db';
    ctx.fillStyle = isHighlightedOutput ? '#ef444420' : '#ffffff';
    ctx.lineWidth = isHighlightedOutput ? 2.5 : 1;
    ctx.beginPath();
    ctx.arc(outputX + outputSize / 2, outputY + outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHighlightedOutput ? '#ef4444' : '#374151';
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♪', outputX + outputSize / 2, outputY + outputSize / 2 + 6);
  }, [highlightedStage]);

  return (
    <div ref={containerRef} className="my-6 overflow-x-auto">
      <div className="flex gap-2 mb-4 flex-wrap">
        {oscillators.map((osc, index) => (
          <button
            key={index}
            onClick={() => setHighlightedStage(highlightedStage === `osc-${index}` ? null : `osc-${index}`)}
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: highlightedStage === `osc-${index}` ? osc.color : '#f3f4f6',
              color: highlightedStage === `osc-${index}` ? '#ffffff' : '#374151'
            }}
          >
            {osc.name}
          </button>
        ))}
        <button
          onClick={() => setHighlightedStage(highlightedStage === 'mixer' ? null : 'mixer')}
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: highlightedStage === 'mixer' ? '#6366f1' : '#f3f4f6',
            color: highlightedStage === 'mixer' ? '#ffffff' : '#374151'
          }}
        >
          Mixer
        </button>
        <button
          onClick={() => setHighlightedStage(highlightedStage === 'filters' ? null : 'filters')}
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: highlightedStage === 'filters' ? '#10b981' : '#f3f4f6',
            color: highlightedStage === 'filters' ? '#ffffff' : '#374151'
          }}
        >
          Filters
        </button>
        <button
          onClick={() => setHighlightedStage(highlightedStage === 'adsr' ? null : 'adsr')}
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: highlightedStage === 'adsr' ? '#f59e0b' : '#f3f4f6',
            color: highlightedStage === 'adsr' ? '#ffffff' : '#374151'
          }}
        >
          ADSR
        </button>
        <button
          onClick={() => setHighlightedStage(highlightedStage === 'filter-envelope' ? null : 'filter-envelope')}
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: highlightedStage === 'filter-envelope' ? '#8b5cf6' : '#f3f4f6',
            color: highlightedStage === 'filter-envelope' ? '#ffffff' : '#374151'
          }}
        >
          Filter Env
        </button>
        <button
          onClick={() => setHighlightedStage(highlightedStage === 'output' ? null : 'output')}
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: highlightedStage === 'output' ? '#ef4444' : '#f3f4f6',
            color: highlightedStage === 'output' ? '#ffffff' : '#374151'
          }}
        >
          Output
        </button>
      </div>
      <canvas
        ref={canvasRef}
        height={350}
        className="bg-white border border-gray-200 rounded"
        style={{ height: '350px', width: '900px' }}
      />
    </div>
  );
}
