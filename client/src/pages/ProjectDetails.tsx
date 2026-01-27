import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { type Task, type Project } from '../types';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Circle, X, Calendar } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Creating a Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // State for Viewing a Task (The new Modal)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    if(!confirm("Are you sure?")) return;
    try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(t => t._id !== taskId));
        if (selectedTask?._id === taskId) setSelectedTask(null); // Close modal if open
    } catch(err) {
        alert("Failed to delete");
    }
  }

  const handleStatusChange = async (e: React.MouseEvent, task: Task, newStatus: 'todo' | 'in-progress' | 'done') => {
      e.stopPropagation(); // Prevent opening modal
      try {
          const updatedTasks = tasks.map(t => 
            t._id === task._id ? { ...t, status: newStatus } : t
          );
          setTasks(updatedTasks);
          await api.patch(`/tasks/${task._id}`, { status: newStatus });
          
          // Update selected task if it's currently open
          if (selectedTask?._id === task._id) {
            setSelectedTask({ ...task, status: newStatus });
          }
      } catch (err) {
          alert("Failed to move task");
      }
  }

  if (loading) return <div className="p-10 text-center">Loading board...</div>;

  // --- Helper Function to Render Columns (Fixed Focus Bug) ---
  // We use a function instead of a Component to keep state simple without prop drilling
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
          {columnTasks.map(task => (
            <div 
                key={task._id} 
                onClick={() => setSelectedTask(task)} // Open Modal
                className="bg-white p-3 rounded shadow-sm border border-gray-200 group hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-gray-800 font-medium">{task.title}</span>
                <button 
                    onClick={(e) => handleDeleteTask(e, task._id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 size={16} />
                </button>
              </div>
              
              {/* Quick Move Buttons */}
              <div className="flex gap-2 mt-3 text-xs text-gray-500">
                  {status !== 'todo' && (
                      <button onClick={(e) => handleStatusChange(e, task, 'todo')} className="hover:text-blue-600">← Todo</button>
                  )}
                  {status !== 'in-progress' && (
                      <button onClick={(e) => handleStatusChange(e, task, 'in-progress')} className="hover:text-blue-600">
                          {status === 'todo' ? 'Start →' : '← Return'}
                      </button>
                  )}
                  {status !== 'done' && (
                      <button onClick={(e) => handleStatusChange(e, task, 'done')} className="hover:text-green-600">Done →</button>
                  )}
              </div>
            </div>
          ))}
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

      {/* --- Task Detail Modal --- */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{selectedTask.title}</h2>
                    <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Status Badge */}
                <div className="mb-6">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold tracking-wide ${
                        selectedTask.status === 'done' ? 'bg-green-100 text-green-700' :
                        selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {selectedTask.status}
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedTask.description || "No description provided."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 border-t pt-4">
                        <Calendar size={16} />
                        Created: {new Date(selectedTask.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;