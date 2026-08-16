import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

function SortableChapterItem({ chapter }) {
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
      <Link to={`/chapters/${chapter.id}`}>{chapter.order}. {chapter.title}</Link>
    </li>
  );
}

export default SortableChapterItem;