import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

function SortableChapterItem({ chapter, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="sortable-chapter">
      <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
      <Link to={`/chapters/${chapter.id}`} style={{ flex: 1 }}>{chapter.order}. {chapter.title}</Link>
      <button className="delete-btn" onClick={onDelete}>✕</button>
    </li>
  );
}

export default SortableChapterItem;