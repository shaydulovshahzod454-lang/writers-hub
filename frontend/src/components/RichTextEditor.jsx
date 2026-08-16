import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

function RichTextEditor({ content, onChange, onCommentRequest }) {
  const [selectionBox, setSelectionBox] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setSelectionBox(null);
        return;
      }
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const editorRect = editor.view.dom.getBoundingClientRect();

      setSelectionBox({
        top: start.top - editorRect.top - 38,
        left: (start.left + end.left) / 2 - editorRect.left,
        text: editor.state.doc.textBetween(from, to, ' '),
      });
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  function handleCommentClick() {
    onCommentRequest(selectionBox.text);
    setSelectionBox(null);
  }

  return (
    <div className="editor-wrapper" style={{ position: 'relative' }}>
      <div className="editor-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • Ro'yxat
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <EditorContent editor={editor} />
        {selectionBox && (
          <button
            type="button"
            className="floating-comment-btn"
            style={{ top: selectionBox.top, left: selectionBox.left }}
            onClick={handleCommentClick}
          >
            💬 Izoh
          </button>
        )}
      </div>
    </div>
  );
}

export default RichTextEditor;