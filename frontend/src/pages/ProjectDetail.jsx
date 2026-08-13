import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacters, createCharacter } from '../api/characters';
import { getChapters, createChapter } from '../api/chapters';
import { getMembers, inviteMember } from '../api/projects';

function ProjectDetail() {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [charName, setCharName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [charsData, chaptersData, membersData] = await Promise.all([
      getCharacters(id),
      getChapters(id),
      getMembers(id),
    ]);
    setCharacters(charsData);
    setChapters(chaptersData);
    setMembers(membersData);
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

  async function handleInvite(e) {
    e.preventDefault();
    setInviteError('');
    if (!inviteUsername.trim()) return;
    try {
      await inviteMember(id, inviteUsername);
      setInviteUsername('');
      loadData();
    } catch (err) {
      setInviteError('User topilmadi yoki xatolik yuz berdi');
    }
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
      <section>
  <h3>Hamkorlar</h3>
  <form onSubmit={handleInvite}>
    <input
      type="text"
      placeholder="Username orqali taklif qilish"
      value={inviteUsername}
      onChange={(e) => setInviteUsername(e.target.value)}
    />
    <button type="submit">Taklif qilish</button>
  </form>
  {inviteError && <p style={{ color: 'red' }}>{inviteError}</p>}
  <ul>
    {members.map((m) => (
      <li key={m.id}>{m.user}</li>
    ))}
  </ul>
</section>
    </div>
  );
}

export default ProjectDetail;