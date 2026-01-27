import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { type Task } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Circle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Creating a Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // --- NEW: Track Expanded Cards (Set allows multiple open at once) ---
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

  // Toggle Accordion Logic
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

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); 
    if(!confirm("Are you sure?")) return;
    try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
    } catch(err) {
        alert("Failed to delete");
    }
  }

  const handleStatusChange = async (e: React.MouseEvent, task: Task, newStatus: 'todo' | 'in-progress' | 'done') => {
      e.stopPropagation();
      try {
          const updatedTasks = tasks.map(t => 
            t._id === task._id ? { ...t, status: newStatus } : t
          );
          setTasks(updatedTasks);
          await api.patch(`/tasks/${task._id}`, { status: newStatus });
      } catch (err) {
          alert("Failed to move task");
      }
  }

  if (loading) return <div className="p-10 text-center">Loading board...</div>;

  const renderColumn = (title: string, status: string, icon: any) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div className="bg-gray-100 p-4 rounded-lg min-h-[500px] w-full min-w-[300px]">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
          {icon}
          {title} 
          <span className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-600">
            {columnTasks.length}
          </span>
        </div>

        <div className="space-y-3">
          {columnTasks.map(task => {
            const isExpanded = expandedTasks.has(task._id);

            return (
              <div 
                  key={task._id} 
                  onClick={() => toggleTaskExpansion(task._id)} // Toggle on click
                  className={`bg-white p-3 rounded shadow-sm border transition cursor-pointer group 
                    ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md'}`}
              >
                {/* Card Header (Always Visible) */}
                <div className="flex justify-between items-start">
                  <span className="text-gray-800 font-medium">{task.title}</span>
                  <div className="flex items-center gap-2">
                    {/* Visual Cue for Expansion */}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    
                    <button 
                        onClick={(e) => handleDeleteTask(e, task._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* --- THE SLIDING SECTION (Description) --- */}
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

                {/* Footer Buttons */}
                <div className="flex gap-2 mt-3 text-xs text-gray-500 border-t border-transparent pt-1">
                    {status !== 'todo' && (
                        <button onClick={(e) => handleStatusChange(e, task, 'todo')} className="hover:text-blue-600 font-medium">← Todo</button>
                    )}
                    {status !== 'in-progress' && (
                        <button onClick={(e) => handleStatusChange(e, task, 'in-progress')} className="hover:text-blue-600 font-medium">
                            {status === 'todo' ? 'Start →' : '← Return'}
                        </button>
                    )}
                    {status !== 'done' && (
                        <button onClick={(e) => handleStatusChange(e, task, 'done')} className="hover:text-green-600 font-medium">Done →</button>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Form Only in Todo */}
        {status === 'todo' && (
            <div className="mt-4">
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Project Board</h1>
      </div>

      {/* Board Columns */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto h-[calc(100vh-100px)]">
        {renderColumn("To Do", "todo", <Circle size={18} className="text-gray-400" />)}
        {renderColumn("In Progress", "in-progress", <Clock size={18} className="text-blue-500" />)}
        {renderColumn("Done", "done", <CheckCircle size={18} className="text-green-500" />)}
      </div>
    </div>
  );
};

export default ProjectDetails;