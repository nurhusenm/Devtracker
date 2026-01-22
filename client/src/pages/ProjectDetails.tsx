import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Hooks for URL handling
import api from '../services/api';
import { type Task, type Project } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Circle } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects`), // Ideally we'd have a getSingleProject endpoint, but we can find it in the list for now or add a specific endpoint later. 
          // Actually, let's just fetch the specific tasks.
          // For the project title, we might need a specific endpoint or just filter the list if we already had it. 
          // To be clean, let's fetch the project specific endpoint if you built it, otherwise fetch tasks.
          
          // Let's rely on your backend structure:
          // You built: GET /api/tasks/project/:projectId
          api.get(`/tasks/project/${id}`)
        ]);

        setTasks(tasksRes.data);
        // Note: We don't have a single project fetch endpoint yet in the guidance, 
        // so the title might be missing unless we add that backend route. 
        // For now, let's just show "Project Details".
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. Handle Create Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: newTaskTitle,
        description: '', // Optional for now
        projectId: id,
        status: 'todo'
      });
      setTasks([...tasks, res.data]); // Optimistic update
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (err) {
      alert('Failed to add task');
    }
  };

  // 3. Handle Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if(!confirm("Are you sure?")) return;
    try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
    } catch(err) {
        alert("Failed to delete");
    }
  }

  // 4. Handle Move Task (Status Update)
  const handleStatusChange = async (task: Task, newStatus: 'todo' | 'in-progress' | 'done') => {
      try {
          // Optimistic UI Update first
          const updatedTasks = tasks.map(t => 
            t._id === task._id ? { ...t, status: newStatus } : t
          );
          setTasks(updatedTasks);

          // API Call
          await api.patch(`/tasks/${task._id}`, { status: newStatus });
      } catch (err) {
          alert("Failed to move task");
          // Revert if failed (optional but good practice)
      }
  }

  if (loading) return <div className="p-10 text-center">Loading board...</div>;

  // 5. Helper to render a column
  const TaskColumn = ({ title, status, icon }: { title: string, status: string, icon: any }) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div className="bg-gray-100 p-4 rounded-lg min-h-[500px]">
        <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
          {icon}
          {title} 
          <span className="bg-gray-200 text-xs px-2 py-1 rounded-full text-gray-600">
            {columnTasks.length}
          </span>
        </div>

        <div className="space-y-3">
          {columnTasks.map(task => (
            <div key={task._id} className="bg-white p-3 rounded shadow-sm border border-gray-200 group">
              <div className="flex justify-between items-start">
                <span className="text-gray-800 font-medium">{task.title}</span>
                <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 size={16} />
                </button>
              </div>
              
              {/* Quick Move Buttons */}
              <div className="flex gap-2 mt-3 text-xs text-gray-500">
                  {status !== 'todo' && (
                      <button onClick={() => handleStatusChange(task, 'todo')} className="hover:text-blue-600">← Todo</button>
                  )}
                  {status !== 'in-progress' && (
                      <button onClick={() => handleStatusChange(task, 'in-progress')} className="hover:text-blue-600">
                          {status === 'todo' ? 'Start →' : '← Return'}
                      </button>
                  )}
                  {status !== 'done' && (
                      <button onClick={() => handleStatusChange(task, 'done')} className="hover:text-green-600">Done →</button>
                  )}
              </div>
            </div>
          ))}
        </div>

        {status === 'todo' && (
            <div className="mt-4">
                {isAddingTask ? (
                    <form onSubmit={handleAddTask} className="bg-white p-3 rounded border border-blue-200">
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Task title..."
                            className="w-full text-sm outline-none mb-2"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                            <button type="button" onClick={() => setIsAddingTask(false)} className="text-gray-500">Cancel</button>
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                        </div>
                    </form>
                ) : (
                    <button 
                        onClick={() => setIsAddingTask(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-200 rounded dashed border border-gray-300"
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

      {/* Board */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto h-[calc(100vh-100px)]">
        <TaskColumn title="To Do" status="todo" icon={<Circle size={18} className="text-gray-400" />} />
        <TaskColumn title="In Progress" status="in-progress" icon={<Clock size={18} className="text-blue-500" />} />
        <TaskColumn title="Done" status="done" icon={<CheckCircle size={18} className="text-green-500" />} />
      </div>
    </div>
  );
};

export default ProjectDetails;