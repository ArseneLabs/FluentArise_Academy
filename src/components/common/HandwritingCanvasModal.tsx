import { useState, useRef, useEffect, useCallback, type MouseEvent, type TouchEvent } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Check,
  X,
  Grid,
  AlignJustify,
  Square,
} from 'lucide-react';

interface HandwritingCanvasModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
  title?: string;
}

type ToolType = 'pen' | 'highlighter' | 'eraser';
type BackgroundType = 'blank' | 'lined' | 'grid' | 'blackboard';

const COLOR_PALETTE = [
  { name: 'Charcoal Black', hex: '#0f172a' },
  { name: 'Ink Blue', hex: '#2563eb' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Emerald Green', hex: '#16a34a' },
  { name: 'Royal Purple', hex: '#7c3aed' },
  { name: 'Warm Amber', hex: '#d97706' },
];

export default function HandwritingCanvasModal({
  open,
  onClose,
  onInsert,
  title = 'Handwritten Notes & Diagrams',
}: HandwritingCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolType>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('lined');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Set up canvas resolution
  const renderBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, bg: BackgroundType) => {
      ctx.save();
      if (bg === 'blackboard') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Slate chalk grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let y = 30; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (bg === 'lined') {
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          for (let y = 34; y < height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
          // Red margin line like a real notebook
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(60, 0);
          ctx.lineTo(60, height);
          ctx.stroke();
        } else if (bg === 'grid') {
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += 24) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    },
    []
  );

  const saveStateToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, url];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Initial setup when modal opens
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 480 * dpr;
      ctx.scale(dpr, dpr);

      renderBackground(ctx, rect.width, 480, backgroundType);
      saveStateToHistory();
    }, 50);

    return () => clearTimeout(timer);
  }, [open]);

  // Handle background type change without losing user strokes
  const handleBgChange = (newBg: BackgroundType) => {
    setBackgroundType(newBg);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load current drawing
    const currentImg = new Image();
    currentImg.src = canvas.toDataURL();
    currentImg.onload = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      renderBackground(ctx, rect.width, 480, newBg);
      ctx.drawImage(currentImg, 0, 0, rect.width, 480);
      ctx.restore();
      saveStateToHistory();
    };
  };

  const getPos = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvt = e as MouseEvent<HTMLCanvasElement>;
    return {
      x: mouseEvt.clientX - rect.left,
      y: mouseEvt.clientY - rect.top,
    };
  };

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = backgroundType === 'blackboard' ? '#0f172a' : '#ffffff';
      ctx.lineWidth = strokeWidth * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = strokeWidth * 5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'bevel';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = backgroundType === 'blackboard' && strokeColor === '#0f172a' ? '#f8fafc' : strokeColor;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
      ctx.globalAlpha = 1.0;
    }
    saveStateToHistory();
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, rect.width, 480);
      setHistoryIndex(newIndex);
    };
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = history[newIndex];
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, rect.width, 480);
      setHistoryIndex(newIndex);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    renderBackground(ctx, rect.width, 480, backgroundType);
    saveStateToHistory();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `lecture-handwriting-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleInsert = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onInsert(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] max-h-[780px] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-ink-900 border border-slate-200 dark:border-ink-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
              <Pen size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                Draw diagrams, equations, or write notes by hand using mouse or stylus pen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-ink-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 dark:border-ink-800 dark:bg-ink-950/50">
          {/* Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTool('pen')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tool === 'pen'
                  ? 'bg-brand-700 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-ink-800'
              }`}
            >
              <Pen size={14} /> Pen
            </button>
            <button
              onClick={() => setTool('highlighter')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tool === 'highlighter'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-ink-800'
              }`}
            >
              <Highlighter size={14} /> Highlighter
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tool === 'eraser'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-ink-800'
              }`}
            >
              <Eraser size={14} /> Eraser
            </button>
          </div>

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 dark:border-ink-800">
            <span className="text-[11px] font-semibold text-slate-400">Size:</span>
            {[2, 4, 8, 14].map((sz) => (
              <button
                key={sz}
                onClick={() => setStrokeWidth(sz)}
                className={`grid h-7 w-7 place-items-center rounded-md border transition ${
                  strokeWidth === sz
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold dark:bg-brand-950 dark:border-brand-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-ink-700 dark:bg-ink-900 dark:text-slate-300'
                }`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Math.min(sz + 2, 12)}px`, height: `${Math.min(sz + 2, 12)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Palette */}
          {tool !== 'eraser' && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 dark:border-ink-800">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setStrokeColor(c.hex)}
                  title={c.name}
                  className={`relative h-6 w-6 rounded-full transition hover:scale-110 ${
                    strokeColor === c.hex ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded-full border-0 p-0"
                title="Custom color"
              />
            </div>
          )}

          {/* Paper Style */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3 dark:border-ink-800">
            <button
              onClick={() => handleBgChange('lined')}
              title="Lined Notebook Paper"
              className={`p-1.5 rounded-lg border transition ${
                backgroundType === 'lined'
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <AlignJustify size={14} />
            </button>
            <button
              onClick={() => handleBgChange('grid')}
              title="Math Grid Paper"
              className={`p-1.5 rounded-lg border transition ${
                backgroundType === 'grid'
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => handleBgChange('blank')}
              title="Blank White Canvas"
              className={`p-1.5 rounded-lg border transition ${
                backgroundType === 'blank'
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Square size={14} />
            </button>
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 disabled:opacity-30 transition"
              title="Undo"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 disabled:opacity-30 transition"
              title="Redo"
            >
              <RotateCw size={15} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
              title="Clear entire canvas"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="relative flex-1 overflow-hidden p-4 bg-slate-100/50 dark:bg-ink-950 flex items-center justify-center">
          <div className="w-full h-full max-h-[480px] rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-ink-800 bg-white">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 dark:border-ink-800">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition dark:border-ink-700 dark:text-slate-300"
          >
            <Download size={14} /> Download Sketch (.png)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition dark:border-ink-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-800 transition"
            >
              <Check size={14} /> Insert Drawing into Lecture Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
