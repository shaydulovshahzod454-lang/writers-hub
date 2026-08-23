import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapter, updateChapter, checkConsistency, getVersions, restoreVersion } from '../api/chapters';
import { getComments, createComment } from '../api/comments';
import { getCharacters } from '../api/characters';
import { getEvidence } from '../api/evidence';
import { getTimelineEvents } from '../api/timeline';
import RichTextEditor from '../components/RichTextEditor';
import Spinner from '../components/Spinner';
import MultiSelect from '../components/MultiSelect';

const AUTOSAVE_DELAY_MS = 2500;

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || div.innerText || '';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ChapterEditor() {
  const { id } = useParams();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [quotedText, setQuotedText] = useState('');
  const [checking, setChecking] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [showContext, setShowContext] = useState(false);
  const [allCharacters, setAllCharacters] = useState([]);
  const [allEvidence, setAllEvidence] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [relatedCharacters, setRelatedCharacters] = useState([]);
  const [relatedEvidence, setRelatedEvidence] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);

  const savedContentRef = useRef('');
  const autosaveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    loadChapter();
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [id]);

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  async function loadChapter() {
    isInitialLoadRef.current = true;
    const [chapterData, commentsData] = await Promise.all([
      getChapter(id),
      getComments(id),
    ]);
    setChapter(chapterData);
    setContent(chapterData.content || '');
    savedContentRef.current = chapterData.content || '';
    setComments(commentsData);
    setRelatedCharacters(chapterData.related_characters || []);
    setRelatedEvidence(chapterData.related_evidence || []);
    setRelatedEvents(chapterData.related_events || []);

    const [charsData, evidenceData, eventsData] = await Promise.all([
      getCharacters(chapterData.project),
      getEvidence(chapterData.project),
      getTimelineEvents(chapterData.project),
    ]);
    setAllCharacters(charsData);
    setAllEvidence(evidenceData);
    setAllEvents(eventsData);
  }

  const saveContent = useCallback(async (contentToSave) => {
    if (contentToSave === savedContentRef.current) return;
    setSaving(true);
    await updateChapter(id, { content: contentToSave });
    savedContentRef.current = contentToSave;
    setSaving(false);
    setDirty(false);
    setStatus('Avtomatik saqlandi ✓');
    setTimeout(() => setStatus(''), 2000);
  }, [id]);

  function handleContentChange(newContent) {
    setContent(newContent);

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    setDirty(newContent !== savedContentRef.current);

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      saveContent(newContent);
    }, AUTOSAVE_DELAY_MS);
  }

  async function handleSave() {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setSaving(true);
    await updateChapter(id, { content, create_version: true });
    savedContentRef.current = content;
    setSaving(false);
    setDirty(false);
    setStatus('Saqlandi ✓');
    setTimeout(() => setStatus(''), 2000);
    if (showHistory) loadVersions();
  }

  async function loadVersions() {
    setLoadingVersions(true);
    try {
      const data = await getVersions(id);
      setVersions(data);
    } finally {
      setLoadingVersions(false);
    }
  }

  function toggleHistory() {
    const next = !showHistory;
    setShowHistory(next);
    if (next) loadVersions();
  }

  async function handleRestore(versionId) {
    if (!window.confirm('Bu versiyani tiklamoqchimisiz? Hozirgi matn ham tarixga saqlanadi, yo\'qolmaydi.')) return;
    const updated = await restoreVersion(id, versionId);
    setContent(updated.content || '');
    savedContentRef.current = updated.content || '';
    setDirty(false);
    setStatus('Versiya tiklandi ✓');
    setTimeout(() => setStatus(''), 2000);
    loadVersions();
  }

  async function handleContextChange(field, ids) {
    if (field === 'related_characters') setRelatedCharacters(ids);
    if (field === 'related_evidence') setRelatedEvidence(ids);
    if (field === 'related_events') setRelatedEvents(ids);
    await updateChapter(id, { [field]: ids });
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
      const backendError = err.response?.data?.error;
      setAiResult(backendError || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setChecking(false);
    }
  }

  if (!chapter) return <div className="page-loading"><Spinner size={36} /></div>;

  const attachedCharacters = allCharacters.filter((c) => relatedCharacters.includes(c.id));
  const attachedEvidence = allEvidence.filter((e) => relatedEvidence.includes(e.id));
  const attachedEvents = allEvents.filter((e) => relatedEvents.includes(e.id));

  return (
    <div>
      <div className="page-header">
        <Link to={`/projects/${chapter.project}`}>← Ortga</Link>
        <h2>{chapter.title}</h2>
        <button onClick={() => setShowContext(!showContext)} className="edit-toggle-btn">
          🧭 {showContext ? 'Kontekstni yopish' : 'Kontekst'}
        </button>
        <button onClick={toggleHistory} className="edit-toggle-btn">
          🕒 {showHistory ? 'Tarixni yopish' : 'Tarix'}
        </button>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          {showHistory && (
            <div className="item-list" style={{ marginBottom: 20 }}>
              {loadingVersions ? (
                <div className="page-loading"><Spinner size={28} /></div>
              ) : versions.length === 0 ? (
                <p className="empty-state">Hali versiya tarixi yo'q. "Saqlash" tugmasini bosganingizda, oldingi holat shu yerda saqlanadi.</p>
              ) : (
                versions.map((v) => (
                  <div className="item-card" key={v.id}>
                    <div className="item-card-header">
                      <strong>{formatDate(v.created_at)}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="muted" style={{ fontSize: 13 }}>{v.created_by_name}</span>
                        <button className="edit-toggle-btn" onClick={() => handleRestore(v.id)}>
                          Tiklash
                        </button>
                      </div>
                    </div>
                    <p className="muted">{stripHtml(v.content).slice(0, 150)}{stripHtml(v.content).length > 150 ? '...' : ''}</p>
                  </div>
                ))
              )}
            </div>
          )}

          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            onCommentRequest={(text) => setQuotedText(text)}
          />
          <br />
          <button onClick={handleSave} disabled={saving} className={saving ? 'btn-loading' : ''}>
            {saving && <Spinner size={16} />}
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <span className="save-status">
            {' '}
            {!saving && status}
            {!saving && !status && dirty && 'Saqlanmagan o\'zgarishlar bor...'}
          </span>

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
                  <button type="button" onClick={() => setQuotedText('')} className="clear-quote-btn">
                    ✕ Bekor qilish
                  </button>
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

        {showContext && (
          <aside className="context-panel">
            <h3>Bob konteksti</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              Shu bobga tegishli personaj, dalil va voqealarni biriktiring — yozayotganda ular shu yerda ko'rinib turadi.
            </p>

            <div className="context-section">
              <label className="context-label">👤 Personajlar</label>
              <MultiSelect
                options={allCharacters}
                selected={relatedCharacters}
                onChange={(ids) => handleContextChange('related_characters', ids)}
                placeholder="Personajlarni biriktirish"
              />
              {attachedCharacters.map((c) => (
                <div className="context-card" key={c.id}>
                  <strong>{c.name}</strong>
                  {c.personality && <p>{c.personality}</p>}
                  {c.motivation && <p className="muted">Motivatsiya: {c.motivation}</p>}
                </div>
              ))}
            </div>

            <div className="context-section">
              <label className="context-label">🔍 Dalillar</label>
              <MultiSelect
                options={allEvidence}
                selected={relatedEvidence}
                onChange={(ids) => handleContextChange('related_evidence', ids)}
                placeholder="Dalillarni biriktirish"
              />
              {attachedEvidence.map((ev) => (
                <div className="context-card" key={ev.id}>
                  <strong>{ev.name}</strong> {ev.is_real ? '' : '(soxta)'}
                  {ev.description && <p>{ev.description}</p>}
                </div>
              ))}
            </div>

            <div className="context-section">
              <label className="context-label">🕐 Voqealar</label>
              <MultiSelect
                options={allEvents.map((e) => ({ id: e.id, name: `${e.event_time} — ${e.title}` }))}
                selected={relatedEvents}
                onChange={(ids) => handleContextChange('related_events', ids)}
                placeholder="Voqealarni biriktirish"
              />
              {attachedEvents.map((ev) => (
                <div className="context-card" key={ev.id}>
                  <strong>{ev.event_time}</strong>
                  <p>{ev.title}</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default ChapterEditor;