import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapter, updateChapter } from '../api/chapters';
import { getComments, createComment } from '../api/comments';
import RichTextEditor from '../components/RichTextEditor';
import Spinner from '../components/Spinner';
import { checkConsistency } from '../api/chapters';

function ChapterEditor() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [quotedText, setQuotedText] = useState('');
  const [checking, setChecking] = useState(false);
const [aiResult, setAiResult] = useState('');

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
  await createComment(id, commentText, quotedText);
  setCommentText('');
  setQuotedText('');
  const updated = await getComments(id);
  setComments(updated);
}

  async function handleCheckConsistency() {
  setChecking(true);
  setAiResult('');
  try {
    const data = await checkConsistency(id);
    setAiResult(data.result);
  } catch (err) {
    setAiResult('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  } finally {
    setChecking(false);
  }
}

  if (!chapter) return <div className="page-loading"><Spinner size={36} /></div>;

  return (
    <div>
      <Link to={`/projects/${chapter.project}`}>← Ortga</Link>
      <h2>{chapter.title}</h2>

      <RichTextEditor
  content={content}
  onChange={setContent}
  onCommentRequest={(text) => setQuotedText(text)}
/>
      <br />
      <button onClick={handleSave} disabled={saving} className={saving ? 'btn-loading' : ''}>
        {saving && <Spinner size={16} />}
        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
      <span> {!saving && status}</span>

      <div className="ai-check-block">
  <button onClick={handleCheckConsistency} disabled={checking} className={checking ? 'btn-loading' : ''}>
    {checking && <Spinner size={16} />}
    {checking ? 'Tekshirilmoqda...' : '🤖 AI orqali tekshirish'}
  </button>
  {aiResult && (
    <div className="ai-result">
      <h4>Natija</h4>
      <p style={{ whiteSpace: 'pre-wrap' }}>{aiResult}</p>
    </div>
  )}
</div>

      <section>
  <h3>Izohlar</h3>

  <form onSubmit={handleAddComment}>
    {quotedText && (
      <div className="quoted-preview">
        <span className="quoted-label">Izoh qoldirilayotgan matn:</span>
        <p>"{quotedText}"</p>
        <button type="button" onClick={() => setQuotedText('')} className="clear-quote-btn">✕ Bekor qilish</button>
      </div>
    )}
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
        {c.quoted_text && (
          <div className="quoted-preview small">
            <p>"{c.quoted_text}"</p>
          </div>
        )}
        <strong>{c.author}:</strong> {c.text}
      </li>
    ))}
  </ul>
</section>
    </div>
  );
}

export default ChapterEditor;