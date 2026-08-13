import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacters, createCharacter } from '../api/characters';
import { getChapters, createChapter } from '../api/chapters';

function ProjectDetail() {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [charName, setCharName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [charsData, chaptersData] = await Promise.all([
      getCharacters(id),
      getChapters(id),
    ]);
    setCharacters(charsData);
    setChapters(chaptersData);
  }

  async function handleAddCharacter(e) {
    e.preventDefault();
    if (!charName.trim()) return;
    await createCharacter({ project: id, name: charName });
    setCharName('');
    loadData();
  }

  async function handleAddChapter(e) {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    await createChapter({ project: id, title: chapterTitle, order: chapters.length + 1 });
    setChapterTitle('');
    loadData();
  }

  return (
    <div>
      <Link to="/dashboard">← Ortga</Link>
      <h2>Loyiha #{id}</h2>

      <section>
        <h3>Personajlar</h3>
        <form onSubmit={handleAddCharacter}>
          <input
            type="text"
            placeholder="Personaj ismi"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
          />
          <button type="submit">Qo'shish</button>
        </form>
        <ul>
          {characters.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Boblar</h3>
        <form onSubmit={handleAddChapter}>
          <input
            type="text"
            placeholder="Bob nomi"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <button type="submit">Qo'shish</button>
        </form>
        <ul>
          {chapters.map((ch) => (
            <li key={ch.id}>
              <Link to={`/chapters/${ch.id}`}>{ch.order}. {ch.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ProjectDetail;