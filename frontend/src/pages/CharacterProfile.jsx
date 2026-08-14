import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCharacter, updateCharacter } from '../api/characters';

const FIELDS = [
  { key: 'name', label: 'Ism', type: 'text' },
  { key: 'alias', label: 'Taxallus', type: 'text' },
  { key: 'age', label: 'Yosh', type: 'number' },
  { key: 'occupation', label: 'Kasb', type: 'text' },
  { key: 'appearance', label: 'Tashqi ko\'rinish', type: 'textarea' },
  { key: 'personality', label: 'Xarakter', type: 'textarea' },
  { key: 'backstory', label: 'O\'tmish', type: 'textarea' },
  { key: 'goal', label: 'Maqsad', type: 'textarea' },
  { key: 'motivation', label: 'Motivatsiya', type: 'textarea' },
];

function CharacterProfile() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadCharacter();
  }, [id]);

  async function loadCharacter() {
    const data = await getCharacter(id);
    setCharacter(data);
    setForm(data);
  }

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setStatus('Saqlanmoqda...');
    await updateCharacter(id, form);
    setStatus('Saqlandi ✓');
    setTimeout(() => setStatus(''), 2000);
  }

  if (!character) return <p>Yuklanmoqda...</p>;

  return (
    <div>
      <div className="page-header">
        <Link to={`/projects/${character.project}`}>← Loyihaga qaytish</Link>
        <h2>{character.name || 'Yangi personaj'}</h2>
        <button onClick={handleSave}>Saqlash</button>
        <span className="muted">{status}</span>
      </div>

      <div className="profile-form">
        {FIELDS.map((field) => (
          <div className="profile-field" key={field.key}>
            <label>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : (
              <input
                type={field.type}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterProfile;