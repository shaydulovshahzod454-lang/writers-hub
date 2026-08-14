import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacters, createCharacter } from '../api/characters';
import { getChapters, createChapter } from '../api/chapters';
import { getMembers, inviteMember } from '../api/projects';
import { getEvidence, createEvidence } from '../api/evidence';
import { getTimelineEvents, createTimelineEvent } from '../api/timeline';
import { getRelationships, createRelationship } from '../api/relationships';
import apiClient from '../api/client';
import MultiSelect from '../components/MultiSelect';

const TABS = [
  { key: 'chapters', label: '📝 Boblar' },
  { key: 'characters', label: '👤 Personajlar' },
  { key: 'evidence', label: '🔍 Dalillar' },
  { key: 'timeline', label: '🕐 Timeline' },
  { key: 'relationships', label: '🔗 Munosabatlar' },
  { key: 'members', label: '👥 Hamkorlar' },
];

function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('chapters');

  const [characters, setCharacters] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [members, setMembers] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [relationships, setRelationships] = useState([]);

  const [charName, setCharName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceLocation, setEvidenceLocation] = useState('');
  const [evidenceIsReal, setEvidenceIsReal] = useState(true);
  const [evidenceCharacters, setEvidenceCharacters] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [relFrom, setRelFrom] = useState('');
  const [relTo, setRelTo] = useState('');
  const [relType, setRelType] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [charsData, chaptersData, membersData, evidenceData, timelineData, relData] =
      await Promise.all([
        getCharacters(id),
        getChapters(id),
        getMembers(id),
        getEvidence(id),
        getTimelineEvents(id),
        getRelationships(id),
      ]);
    setCharacters(charsData);
    setChapters(chaptersData);
    setMembers(membersData);
    setEvidenceList(evidenceData);
    setTimelineEvents(timelineData);
    setRelationships(relData);
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

  async function handleAddEvidence(e) {
    e.preventDefault();
    if (!evidenceName.trim()) return;
    await createEvidence({
      project: id,
      name: evidenceName,
      description: evidenceDescription,
      found_location: evidenceLocation,
      is_real: evidenceIsReal,
      related_characters: evidenceCharacters,
    });
    setEvidenceName('');
    setEvidenceDescription('');
    setEvidenceLocation('');
    setEvidenceIsReal(true);
    setEvidenceCharacters([]);
    loadData();
  }

  function handleCharacterCheckbox(charId) {
    setEvidenceCharacters((prev) =>
      prev.includes(charId) ? prev.filter((c) => c !== charId) : [...prev, charId]
    );
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    await createTimelineEvent({
      project: id,
      title: eventTitle,
      event_time: eventTime,
      order: timelineEvents.length + 1,
    });
    setEventTitle('');
    setEventTime('');
    loadData();
  }

  async function handleAddRelationship(e) {
    e.preventDefault();
    if (!relFrom || !relTo || !relType.trim()) return;
    await createRelationship({
      from_character: relFrom,
      to_character: relTo,
      relationship_type: relType,
    });
    setRelFrom('');
    setRelTo('');
    setRelType('');
    loadData();
  }

  async function handleExport() {
    const response = await apiClient.get(`/projects/${id}/export_docx/`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asar.docx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div>
      <div className="page-header">
        <Link to="/dashboard">← Loyihalarim</Link>
        <h2>Loyiha #{id}</h2>
        <button onClick={handleExport}>📄 DOCX yuklab olish</button>
      </div>

      <div className="workspace">
        <div className="workspace-sidebar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="workspace-content">
          {activeTab === 'chapters' && (
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
          )}

          {activeTab === 'characters' && (
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
                  <li key={c.id}>
                    <Link to={`/characters/${c.id}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'evidence' && (
  <section>
    <h3>Dalillar</h3>

    <form onSubmit={handleAddEvidence} className="stacked-form">
      <div className="form-group">
        <label>Dalil nomi</label>
        <input
          type="text"
          placeholder="Masalan: Qizil ro'mol"
          value={evidenceName}
          onChange={(e) => setEvidenceName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Tavsifi</label>
        <textarea
          rows={3}
          placeholder="Dalil haqida batafsil"
          value={evidenceDescription}
          onChange={(e) => setEvidenceDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Qayerdan topildi</label>
        <input
          type="text"
          placeholder="Masalan: Yotoqxona javoni"
          value={evidenceLocation}
          onChange={(e) => setEvidenceLocation(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={evidenceIsReal}
            onChange={(e) => setEvidenceIsReal(e.target.checked)}
          />
          {' '}Haqiqiy dalil (belgisiz qoldirilsa — soxta)
        </label>
      </div>

      <div className="form-group">
        <label>Qaysi personajlarga bog'liq</label>
        {characters.length === 0 ? (
          <p className="muted">Avval "Personajlar" bo'limida personaj qo'shing</p>
        ) : (
          <MultiSelect
            options={characters}
            selected={evidenceCharacters}
            onChange={setEvidenceCharacters}
            placeholder="Personajlarni tanlang"
          />
        )}
      </div>

      <button type="submit" className="submit-btn">+ Dalil qo'shish</button>
    </form>

    <div className="item-list">
      {evidenceList.map((ev) => (
        <div className="item-card" key={ev.id}>
          <div className="item-card-header">
            <strong>{ev.name}</strong>
            <span className={ev.is_real ? 'badge badge-real' : 'badge badge-fake'}>
              {ev.is_real ? 'Haqiqiy' : 'Soxta'}
            </span>
          </div>
          {ev.found_location && (
            <p className="muted">📍 {ev.found_location}</p>
          )}
          {ev.description && <p>{ev.description}</p>}
        </div>
      ))}
    </div>
  </section>
)}

          {activeTab === 'timeline' && (
            <section>
              <h3>Voqealar tarixi (Timeline)</h3>
              <form onSubmit={handleAddEvent}>
                <input
                  type="text"
                  placeholder="Vaqt (masalan: 12-may, 18:00)"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Voqea tavsifi"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <button type="submit">Qo'shish</button>
              </form>
              <ul>
                {timelineEvents.map((ev) => (
                  <li key={ev.id}>
                    <strong>{ev.event_time}</strong> — {ev.title}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'relationships' && (
            <section>
              <h3>Munosabatlar</h3>
              <form onSubmit={handleAddRelationship}>
                <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)}>
                  <option value="">Kimdan</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select value={relTo} onChange={(e) => setRelTo(e.target.value)}>
                  <option value="">Kimga</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Munosabat turi (Friend, Enemy...)"
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                />
                <button type="submit">Qo'shish</button>
              </form>
              <ul>
                {relationships.map((r) => (
                  <li key={r.id}>
                    {r.from_character_name} → {r.to_character_name}: {r.relationship_type}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeTab === 'members' && (
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
              {inviteError && <p style={{ color: 'var(--danger)' }}>{inviteError}</p>}
              <ul>
                {members.map((m) => (
                  <li key={m.id}>{m.user}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;