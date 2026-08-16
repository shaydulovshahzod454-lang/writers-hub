import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapter, updateChapter } from '../api/chapters';
import { getComments, createComment } from '../api/comments';
import RichTextEditor from '../components/RichTextEditor';
import Spinner from '../components/Spinner';

function ChapterEditor() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadChapter();
  }, [id]);

  async function loadChapter() {
    const [chapterData, commentsData] = await Promise.all([
      getChapter(id),
      getComments(id),
    ]);
    setChapter(chapterData);
    setContent(chapterData.content || '');
    setComments(commentsData);
  }

  async function handleSave() {
    setSaving(true);
    await updateChapter(id, { content });
    setSaving(false);
    setStatus('Saqlandi ✓');
    setTimeout(() => setStatus(''), 2000);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    await createComment(id, commentText);
    setCommentText('');
    const updated = await getComments(id);
    setComments(updated);
  }

  if (!chapter) return <div className="page-loading"><Spinner size={36} /></div>;

  return (
    <div>
      <Link to={`/projects/${chapter.project}`}>← Ortga</Link>
      <h2>{chapter.title}</h2>

      <RichTextEditor content={content} onChange={setContent} />
      <br />
      <button onClick={handleSave} disabled={saving} className={saving ? 'btn-loading' : ''}>
        {saving && <Spinner size={16} />}
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
      <span> {!saving && status}</span>

      <section>
        <h3>Izohlar</h3>
        <form onSubmit={handleAddComment}>
          <input
            type="text"
            placeholder="Izoh yozing"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Yuborish</button>
        </form>
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              <strong>{c.author}:</strong> {c.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ChapterEditor;