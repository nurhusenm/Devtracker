import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableTaskProps {
  id: string;
  children: React.ReactNode;
}

export const DraggableTask = ({ id, children }: DraggableTaskProps) => {
  // hook provided by dnd-kit
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  // Calculate movement styles
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};