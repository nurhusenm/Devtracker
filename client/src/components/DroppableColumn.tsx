import { useDroppable } from '@dnd-kit/core';



interface DroppableColumnProps {

  id: string; // This will be 'todo', 'in-progress', or 'done'

  children: React.ReactNode;

  className?: string;

}



export const DroppableColumn = ({ id, children, className }: DroppableColumnProps) => {

  const { setNodeRef } = useDroppable({

    id: id,

  });



  return (

    <div ref={setNodeRef} className={className}>

      {children}

    </div>

  );

};