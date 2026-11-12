import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  PenTool,
  Image as ImageIcon,
} from 'lucide-react';
import HandwritingCanvasModal from './HandwritingCanvasModal';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  helperText?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write comprehensive lecture notes, takeaways, or study guide…',
  minHeight = '240px',
  label,
  helperText,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [showHandwritingModal, setShowHandwritingModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const isUpdatingRef = useRef(false);

  // Sync value to editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
        updateStats();
      }
    }
  }, [value]);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateStats();
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput({} as any);
    }
  };

  const handleHeading = (tag: string) => {
    if (tag === 'p') {
      exec('formatBlock', '<p>');
    } else {
      exec('formatBlock', `<${tag}>`);
    }
  };

  const handleLink = () => {
    const selection = window.getSelection();
    const defaultUrl = 'https://';
    const url = prompt('Enter link URL (e.g. https://example.com):', defaultUrl);
    if (url && url !== defaultUrl) {
      exec('createLink', url);
    }
  };

  const handleInsertHandwriting = (dataUrl: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Create an image element with styling
    const imgHtml = `<figure class="my-4 text-center"><img src="${dataUrl}" alt="Handwritten Note / Diagram" class="mx-auto rounded-xl border border-slate-200 shadow-sm max-w-full h-auto" /><figcaption class="text-[11px] text-slate-400 mt-1 italic">Handwritten lecture sketch</figcaption></figure><p><br></p>`;
    document.execCommand('insertHTML', false, imgHtml);
    handleInput({} as any);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">Word-style formatting & handwriting enabled</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-900">
        {/* Sticky Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/80 p-2 dark:border-ink-800 dark:bg-ink-950/60">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            <button
              type="button"
              onClick={() => handleHeading('h2')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Heading 1 (H2)"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h3')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Heading 2 (H3)"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h4')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Subheading (H4)"
            >
              <Heading3 size={15} />
            </button>
          </div>

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            <button
              type="button"
              onClick={() => exec('bold')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Bold (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Italic (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Underline (Ctrl+U)"
            >
              <Underline size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('strikeThrough')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Strikethrough"
            >
              <Strikethrough size={15} />
            </button>
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            {[
              { color: '#0f172a', title: 'Black' },
              { color: '#2563eb', title: 'Blue' },
              { color: '#dc2626', title: 'Red' },
              { color: '#16a34a', title: 'Green' },
              { color: '#7c3aed', title: 'Purple' },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => exec('foreColor', c.color)}
                title={`Text Color: ${c.title}`}
                className="h-4 w-4 rounded-full border border-slate-300 transition hover:scale-125 dark:border-ink-700"
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>

          {/* Lists & Alignment */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Bulleted List"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Numbered List"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('formatBlock', '<blockquote>')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Blockquote"
            >
              <Quote size={15} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            <button
              type="button"
              onClick={() => exec('justifyLeft')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Align Left"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyCenter')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Align Center"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyRight')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Align Right"
            >
              <AlignRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyFull')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Justify"
            >
              <AlignJustify size={15} />
            </button>
          </div>

          {/* Links & Divider */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 dark:border-ink-800">
            <button
              type="button"
              onClick={handleLink}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Insert Link"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('insertHorizontalRule')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-ink-800"
              title="Horizontal Divider"
            >
              <Minus size={15} />
            </button>
          </div>

          {/* HANDWRITING & SKETCH BUTTON */}
          <button
            type="button"
            onClick={() => setShowHandwritingModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-coral-50 px-2.5 py-1 text-xs font-bold text-coral-700 hover:bg-coral-100 transition dark:bg-coral-950/40 dark:text-coral-300"
            title="Open canvas to write by hand or sketch diagrams"
          >
            <PenTool size={13} />
            <span>Write by Hand / Sketch</span>
          </button>

          {/* Undo / Redo & Clear */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              type="button"
              onClick={() => exec('undo')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-200/60 transition dark:hover:bg-ink-800"
              title="Undo"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec('redo')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-200/60 transition dark:hover:bg-ink-800"
              title="Redo"
            >
              <RotateCw size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec('removeFormat')}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-200/60 transition dark:hover:bg-ink-800"
              title="Clear Formatting"
            >
              <RemoveFormatting size={14} />
            </button>
          </div>
        </div>

        {/* ContentEditable Editor Body */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          style={{ minHeight }}
          className="prose prose-slate max-w-none p-4 text-sm leading-relaxed text-slate-800 outline-none focus:outline-none dark:prose-invert dark:text-slate-100 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        />

        {/* Bottom stats bar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-1.5 text-[11px] text-slate-400 dark:border-ink-800 dark:bg-ink-950/40">
          <span>{helperText || 'Rich notes format ready for students'}</span>
          <span className="font-medium">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} characters
          </span>
        </div>
      </div>

      {/* Handwriting / Drawing Canvas Modal */}
      <HandwritingCanvasModal
        open={showHandwritingModal}
        onClose={() => setShowHandwritingModal(false)}
        onInsert={handleInsertHandwriting}
      />
    </div>
  );
}
