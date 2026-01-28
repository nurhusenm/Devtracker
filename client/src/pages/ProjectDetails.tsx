import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { type Task } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Circle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
// --- NEW IMPORTS FOR DRAG AND DROP ---
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { DraggableTask } from '../components/DraggableTask';
import { DroppableColumn } from '../components/DroppableColumn';
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/tasks/project/${id}`);
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleTaskExpansion = (taskId: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
        newSet.delete(taskId);
    } else {
        newSet.add(taskId);
    }
    setExpandedTasks(newSet);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: newTaskTitle,
        description: newTaskDesc,
        projectId: id,
        status: 'todo'
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setIsAddingTask(false);
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent | React.TouchEvent, taskId: string) => {
    e.stopPropagation(); 
    if(!confirm("Are you sure?")) return;
    try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
    } catch(err) {
        alert("Failed to delete");
    }
  }

  // Refactored: Reusable function for button clicks AND drag drops
  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
        // 1. Optimistic Update
        setTasks(prevTasks => prevTasks.map(t => 
            t._id === taskId ? { ...t, status: newStatus } : t
        ));

        // 2. API Call
        await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
        alert("Failed to update status");
        // Optional: Revert state here on error
    }
  };

  const handleStatusButtonClick = (e: React.MouseEvent, taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
      e.stopPropagation();
      updateTaskStatus(taskId, newStatus);
  };

  // --- NEW: The Drag End Handler ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If dropped nowhere, or dropped on the same column it started in
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'todo' | 'in-progress' | 'done';

    const currentTask = tasks.find(t => t._id === taskId);
    
    // Only update if the status actually changed
    if (currentTask && currentTask.status !== newStatus) {
        updateTaskStatus(taskId, newStatus);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading board...</div>;

  const renderColumn = (title: string, status: string, icon: any) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      // FIX 1: Changed 'min-h-[500px]' to 'h-full max-h-full' 
      // This forces the gray column to respect the screen boundaries
      <DroppableColumn 
        id={status} 
        className="bg-gray-100 p-4 rounded-lg h-full max-h-full w-full min-w-[300px] flex flex-col"
      >
        {/* Header stays the same */}
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700 flex-shrink-0">
          {icon}
          {title} 
          <span className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-600">
            {columnTasks.length}
          </span>
        </div>

        {/* FIX 2: Added 'overflow-y-auto' and 'pr-2' (padding for scrollbar) */}
        {/* This creates the scrollbar INSIDE the gray box */}
        <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
          {columnTasks.map(task => {
            const isExpanded = expandedTasks.has(task._id);

            return (
              <DraggableTask key={task._id} id={task._id}>
                 {/* ... Your existing Task Card code (No changes needed inside here) ... */}
                 <div 
                      onClick={() => toggleTaskExpansion(task._id)} 
                      className={`bg-white p-3 rounded shadow-sm border transition cursor-pointer group 
                        ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-gray-800 font-medium">{task.title}</span>
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleDeleteTask(e, task._id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {task.description || <span className="italic text-gray-400">No description provided.</span>}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                                <Calendar size={12} />
                                {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mt-3 text-xs text-gray-500 border-t border-transparent pt-1" onPointerDown={(e) => e.stopPropagation()}>
                        {status !== 'todo' && (
                            <button onClick={(e) => handleStatusButtonClick(e, task._id, 'todo')} className="hover:text-blue-600 font-medium">← Todo</button>
                        )}
                        {status !== 'in-progress' && (
                            <button onClick={(e) => handleStatusButtonClick(e, task._id, 'in-progress')} className="hover:text-blue-600 font-medium">
                                {status === 'todo' ? 'Start →' : '← Return'}
                            </button>
                        )}
                        {status !== 'done' && (
                            <button onClick={(e) => handleStatusButtonClick(e, task._id, 'done')} className="hover:text-green-600 font-medium">Done →</button>
                        )}
                    </div>
                  </div>
              </DraggableTask>
            );
          })}
        </div>

        {/* Footer (Add Button) stays fixed at bottom */}
        {status === 'todo' && (
            <div className="mt-4 flex-shrink-0">
               {/* ... Your existing Add Task Form code ... */}
               {isAddingTask ? (
                    <form onSubmit={handleAddTask} className="bg-white p-3 rounded border border-blue-200 shadow-sm">
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Task title..."
                            className="w-full text-sm font-medium outline-none mb-2 border-b border-gray-100 pb-1"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            required 
                        />
                        <textarea 
                            placeholder="Description (optional)..."
                            className="w-full text-xs text-gray-600 outline-none resize-none mb-2 bg-gray-50 p-2 rounded"
                            rows={2}
                            value={newTaskDesc}
                            onChange={e => setNewTaskDesc(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                            <button type="button" onClick={() => setIsAddingTask(false)} className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">Cancel</button>
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add</button>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAddingTask(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-200 rounded dashed border border-gray-300 transition"
                    >
                        <Plus size={16} /> Add Task
                    </button>
                )}
            </div>
        )}
      </DroppableColumn>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Project Board</h1>
      </div>

     {/* FIX 3: Add modifiers={[restrictToWindowEdges]} */}
     <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto h-[calc(100vh-100px)]">
            {renderColumn("To Do", "todo", <Circle size={18} className="text-gray-400" />)}
            {renderColumn("In Progress", "in-progress", <Clock size={18} className="text-blue-500" />)}
            {renderColumn("Done", "done", <CheckCircle size={18} className="text-green-500" />)}
        </div>
      </DndContext>
    </div>
  );
};

export default ProjectDetails;