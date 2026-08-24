import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCharacters, createCharacter, deleteCharacter } from '../api/characters';
import { getChapters, createChapter, reorderChapters, deleteChapter } from '../api/chapters';
import { getMembers, inviteMember } from '../api/projects';
import { getEvidence, createEvidence, deleteEvidence } from '../api/evidence';
import { getTimelineEvents, createTimelineEvent, deleteTimelineEvent } from '../api/timeline';
import { getRelationships, createRelationship, deleteRelationship } from '../api/relationships';
import apiClient from '../api/client';
import MultiSelect from '../components/MultiSelect';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableChapterItem from '../components/SortableChapterItem';
import RelationshipGraph from '../components/RelationshipGraph';

const TABS = [
  { key: 'chapters', label: '📝 Boblar' },
  { key: 'characters', label: '👤 Personajlar' },
  { key: 'evidence', label: '🔍 Dalillar' },
  { key: 'timeline', label: '🕐 Timeline' },
  { key: 'relationships', label: '🔗 Munosabatlar' },
  { key: 'members', label: '👥 Hamkorlar' },
];

function confirmDelete(message) {
  return window.confirm(message);
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chapters');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

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

  async function handleDeleteCharacter(e, charId, name) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete(`"${name}" personajini o'chirmoqchimisiz?`)) return;
    await deleteCharacter(charId);
    loadData();
  }

  async function handleAddChapter(e) {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    await createChapter({ project: id, title: chapterTitle, order: chapters.length + 1 });
    setChapterTitle('');
    loadData();
  }

  async function handleDeleteChapter(chapterId, title) {
    if (!confirmDelete(`"${title}" bobini o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.`)) return;
    await deleteChapter(chapterId);
    loadData();
  }

  async function handleChapterDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex);

    const withNewOrder = reordered.map((c, index) => ({ ...c, order: index + 1 }));
    setChapters(withNewOrder);

    await reorderChapters(
      withNewOrder.map((c) => ({ id: c.id, order: c.order }))
    );
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

  async function handleDeleteEvidence(evId, name) {
    if (!confirmDelete(`"${name}" dalilini o'chirmoqchimisiz?`)) return;
    await deleteEvidence(evId);
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

  async function handleDeleteEvent(eventId, title) {
    if (!confirmDelete(`"${title}" voqeasini o'chirmoqchimisiz?`)) return;
    await deleteTimelineEvent(eventId);
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

  async function handleDeleteRelationship(relId) {
    if (!confirmDelete('Bu munosabatni o\'chirmoqchimisiz?')) return;
    await deleteRelationship(relId);
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

    const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    chapters.forEach((ch) => {
      if (ch.title.toLowerCase().includes(q)) {
        results.push({ type: 'Bob', icon: '📝', label: ch.title, key: `ch-${ch.id}`, link: `/chapters/${ch.id}` });
      }
    });
    characters.forEach((c) => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ type: 'Personaj', icon: '👤', label: c.name, key: `char-${c.id}`, link: `/characters/${c.id}` });
      }
    });
    evidenceList.forEach((ev) => {
      if (ev.name.toLowerCase().includes(q)) {
        results.push({ type: 'Dalil', icon: '🔍', label: ev.name, key: `ev-${ev.id}`, tab: 'evidence' });
      }
    });
    timelineEvents.forEach((ev) => {
      if (ev.title.toLowerCase().includes(q)) {
        results.push({ type: 'Timeline', icon: '🕐', label: ev.title, key: `tl-${ev.id}`, tab: 'timeline' });
      }
    });

    return results.slice(0, 15);
  }, [searchQuery, chapters, characters, evidenceList, timelineEvents]);

  function handleSearchResultClick(result) {
    setSearchQuery('');
    setSearchOpen(false);
    if (result.link) {
      navigate(result.link);
    } else if (result.tab) {
      setActiveTab(result.tab);
    }
  }

  return (
    <div>
            <div className="page-header">
        <Link to="/dashboard">← Loyihalarim</Link>
        <h2>Loyiha #{id}</h2>
        <div className="project-search">
          <input
            type="text"
            placeholder="🔎 Loyiha bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          />
          {searchOpen && searchQuery.trim() && (
            <div className="search-dropdown">
              {searchResults.length === 0 ? (
                <p className="search-empty">Hech narsa topilmadi</p>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className="search-result-item"
                    onMouseDown={() => handleSearchResultClick(r)}
                  >
                    <span className="search-result-icon">{r.icon}</span>
                    <span className="search-result-label">{r.label}</span>
                    <span className="search-result-type">{r.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
              {chapters.length === 0 ? (
                <p className="empty-state">Hali bob yo'q. Birinchisini yarating!</p>
              ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
                  <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <ul>
                      {chapters.map((ch) => (
                        <SortableChapterItem
                          key={ch.id}
                          chapter={ch}
                          onDelete={() => handleDeleteChapter(ch.id, ch.title)}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
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
              {characters.length === 0 ? (
                <p className="empty-state">Hali personaj yo'q. Birinchisini qo'shing!</p>
              ) : (
                <ul>
                  {characters.map((c) => (
                    <li key={c.id} className="list-row">
                      <Link to={`/characters/${c.id}`}>{c.name}</Link>
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteCharacter(e, c.id, c.name)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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

              {evidenceList.length === 0 ? (
                <p className="empty-state">Hali dalil yo'q.</p>
              ) : (
                <div className="item-list">
                  {evidenceList.map((ev) => (
                    <div className="item-card" key={ev.id}>
                      <div className="item-card-header">
                        <strong>{ev.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={ev.is_real ? 'badge badge-real' : 'badge badge-fake'}>
                            {ev.is_real ? 'Haqiqiy' : 'Soxta'}
                          </span>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteEvidence(ev.id, ev.name)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {ev.found_location && (
                        <p className="muted">📍 {ev.found_location}</p>
                      )}
                      {ev.description && <p>{ev.description}</p>}
                    </div>
                  ))}
                </div>
              )}
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
              {timelineEvents.length === 0 ? (
                <p className="empty-state">Hali voqea yo'q.</p>
              ) : (
                <ul>
                  {timelineEvents.map((ev) => (
                    <li key={ev.id} className="list-row">
                      <span><strong>{ev.event_time}</strong> — {ev.title}</span>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

                    {activeTab === 'relationships' && (
            <section>
              <h3>Munosabatlar</h3>

              {relationships.length > 0 && (
                <RelationshipGraph characters={characters} relationships={relationships} />
              )}

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
              {relationships.length === 0 ? (
                <p className="empty-state">Hali munosabat yo'q.</p>
              ) : (
                <ul>
                  {relationships.map((r) => (
                    <li key={r.id} className="list-row">
                      <span>{r.from_character_name} → {r.to_character_name}: {r.relationship_type}</span>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteRelationship(r.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'members' && (
            <section>
              <h3>Hamkorlar</h3>
              <form onSubmit={handleInvite}>
                <input
                  type="text"
                  placeholder="Email orqali taklif qilish"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                />
                <button type="submit">Taklif qilish</button>
              </form>
              {inviteError && <p style={{ color: 'var(--danger)' }}>{inviteError}</p>}
              {members.length === 0 ? (
                <p className="empty-state">Hali hamkor yo'q. Sherigingizni email orqali taklif qiling.</p>
              ) : (
                <ul>
                  {members.map((m) => (
                    <li key={m.id}>{m.user_name || m.user_email}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;