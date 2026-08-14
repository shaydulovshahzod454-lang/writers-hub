import { useState, useRef, useEffect } from 'react';

function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOption(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  const selectedLabels = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.name)
    .join(', ');

  return (
    <div className="multiselect" ref={ref}>
      <button
        type="button"
        className="multiselect-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedLabels || placeholder || 'Tanlang'}
      </button>
      {open && (
        <div className="multiselect-panel">
          {options.length === 0 ? (
            <p className="muted" style={{ padding: '6px 8px' }}>Ro'yxat bo'sh</p>
          ) : (
            options.map((o) => (
              <label className="multiselect-option" key={o.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(o.id)}
                  onChange={() => toggleOption(o.id)}
                />
                {o.name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;