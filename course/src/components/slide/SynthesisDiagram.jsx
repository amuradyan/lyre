import { useEffect, useRef } from 'react';

const oscillators = [
  { name: 'OSC 1', freq: 233, amp: 100, db: '0 dB', note: 'A#3' },
  { name: 'OSC 2', freq: 466, amp: 50, db: '-6 dB', note: 'A#4' },
  { name: 'OSC 4', freq: 932, amp: 92, db: '-0.7 dB', note: 'A#5' },
  { name: 'OSC 8', freq: 1864, amp: 81, db: '-1.8 dB', note: 'A#6' },
  { name: 'OSC 18', freq: 4196, amp: 93, db: '-0.6 dB', note: 'C8' }
];

export default function SynthesisDiagram() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = 900;
    canvas.height = 320;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const sliceWidth = width / 6;
    const titleHeight = 30;
    const descHeight = 50;
    const contentHeight = height - titleHeight - descHeight;

    const drawSlice = (index, title) => {
      const x = index * sliceWidth;

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + sliceWidth / 2, 20);

      return { x, contentY: titleHeight, descY: height - descHeight };
    };

    // SLICE 1: OSCILLATORS
    const osc = drawSlice(0, 'OSCILLATORS');
    const oscBoxWidth = 120;
    const oscBoxHeight = 40;
    const oscBoxX = osc.x + (sliceWidth - oscBoxWidth) / 2;
    let oscBoxY = osc.contentY + 10;

    oscillators.forEach((o, i) => {
      ctx.strokeStyle = '#374151';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(oscBoxX, oscBoxY, oscBoxWidth, oscBoxHeight, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(o.name, oscBoxX + oscBoxWidth / 2, oscBoxY + 16);
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillText(`${o.freq} Hz - ${o.note}`, oscBoxX + oscBoxWidth / 2, oscBoxY + 28);
      ctx.fillText(`${o.amp}% (${o.db})`, oscBoxX + oscBoxWidth / 2, oscBoxY + 39);

      oscBoxY += oscBoxHeight + 5;
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const oscTextY = osc.descY + 15;
    ctx.fillText('Pure sine waves', osc.x + sliceWidth / 2, oscTextY);
    ctx.fillText('at specific frequencies', osc.x + sliceWidth / 2, oscTextY + 14);

    // SLICE 2: MIXER
    const mixer = drawSlice(1, 'MIXER');
    ctx.fillStyle = '#374151';
    ctx.font = '36px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Σ', mixer.x + sliceWidth / 2, mixer.contentY + 120);

    ctx.fillStyle = '#374151';
    ctx.font = '12px Nunito, sans-serif';
    ctx.fillText('Additive', mixer.x + sliceWidth / 2, mixer.contentY + 150);
    ctx.fillText('synthesis', mixer.x + sliceWidth / 2, mixer.contentY + 165);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    const mixerTextY = mixer.descY + 15;
    ctx.fillText('All signals', mixer.x + sliceWidth / 2, mixerTextY);
    ctx.fillText('summed together', mixer.x + sliceWidth / 2, mixerTextY + 14);

    // SLICE 3: FILTERS
    const filt = drawSlice(2, 'FILTERS');
    const filtBoxWidth = 130;
    const filtBoxHeight = 55;
    const filtBoxX = filt.x + (sliceWidth - filtBoxWidth) / 2;

    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(filtBoxX, filt.contentY + 30, filtBoxWidth, filtBoxHeight, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Low-pass', filtBoxX + filtBoxWidth / 2, filt.contentY + 30 + 19);
    ctx.font = '11px Nunito, sans-serif';
    ctx.fillText('Cutoff: ~6kHz', filtBoxX + filtBoxWidth / 2, filt.contentY + 30 + 33);
    ctx.fillText('Resonance: 0.3', filtBoxX + filtBoxWidth / 2, filt.contentY + 30 + 46);

    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(filtBoxX, filt.contentY + 95, filtBoxWidth, filtBoxHeight, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText('Body resonance', filtBoxX + filtBoxWidth / 2, filt.contentY + 95 + 19);
    ctx.font = '11px Nunito, sans-serif';
    ctx.fillText('Peaks at 1400 Hz', filtBoxX + filtBoxWidth / 2, filt.contentY + 95 + 33);
    ctx.fillText('and 3100 Hz', filtBoxX + filtBoxWidth / 2, filt.contentY + 95 + 46);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    const filtTextY = filt.descY + 15;
    ctx.fillText('Shape tone,', filt.x + sliceWidth / 2, filtTextY);
    ctx.fillText('add resonance', filt.x + sliceWidth / 2, filtTextY + 14);

    // SLICE 4: ADSR
    const adsr = drawSlice(3, 'ADSR');
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const adsrY = adsr.contentY + 100;
    ctx.fillText('Attack: 5ms', adsr.x + sliceWidth / 2, adsrY);
    ctx.fillText('Decay: 200ms', adsr.x + sliceWidth / 2, adsrY + 22);
    ctx.fillText('Sustain: 30%', adsr.x + sliceWidth / 2, adsrY + 44);
    ctx.fillText('Release: 800ms', adsr.x + sliceWidth / 2, adsrY + 66);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    const adsrTextY = adsr.descY + 15;
    ctx.fillText('Volume over time', adsr.x + sliceWidth / 2, adsrTextY);
    ctx.fillText('Pluck → ring out', adsr.x + sliceWidth / 2, adsrTextY + 14);

    // SLICE 5: FILTER ENVELOPE
    const fenv = drawSlice(4, 'FILTER ENV');
    ctx.fillStyle = '#374151';
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const fenvY = fenv.contentY + 100;
    ctx.fillText('Cutoff frequency', fenv.x + sliceWidth / 2, fenvY);
    ctx.fillText('starts high,', fenv.x + sliceWidth / 2, fenvY + 22);
    ctx.fillText('drops over time', fenv.x + sliceWidth / 2, fenvY + 44);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    const fenvTextY = fenv.descY + 15;
    ctx.fillText('Bright attack', fenv.x + sliceWidth / 2, fenvTextY);
    ctx.fillText('→ mellow tone', fenv.x + sliceWidth / 2, fenvTextY + 14);

    // SLICE 6: OUTPUT
    const out = drawSlice(5, 'OUTPUT');
    ctx.fillStyle = '#374151';
    ctx.font = '48px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♪', out.x + sliceWidth / 2, out.contentY + 120);

    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Nunito, sans-serif';
    const outTextY = out.descY + 20;
    ctx.fillText('Final sound', out.x + sliceWidth / 2, outTextY);
  }, []);

  return (
    <div ref={containerRef} className="my-6 overflow-x-auto">
      <canvas
        ref={canvasRef}
        height={320}
        className="bg-white border border-gray-200 rounded"
        style={{ height: '320px', width: '900px' }}
      />
    </div>
  );
}
