import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
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
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;