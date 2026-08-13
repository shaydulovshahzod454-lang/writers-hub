import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapter, updateChapter } from '../api/chapters';

function ChapterEditor() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadChapter();
  }, [id]);

  async function loadChapter() {
    const data = await getChapter(id);
    setChapter(data);
    setContent(data.content || '');
  }

  async function handleSave() {
    setStatus('Saqlanmoqda...');
    await updateChapter(id, { content });
    setStatus('Saqlandi ✓');
    setTimeout(() => setStatus(''), 2000);
  }

  if (!chapter) return <p>Yuklanmoqda...</p>;

  return (
    <div>
      <Link to={`/projects/${chapter.project}`}>← Ortga</Link>
      <h2>{chapter.title}</h2>

      <textarea
        rows={20}
        cols={80}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <button onClick={handleSave}>Saqlash</button>
      <span> {status}</span>
    </div>
  );
}

export default ChapterEditor;