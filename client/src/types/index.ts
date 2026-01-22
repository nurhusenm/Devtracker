export interface Project {
    _id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'archived';
    owner: 'string';
    createdAt: string;
}

export interface Task {
    _id: string;
    projectId: string; // Links the task to a specific project
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done'; // The key for your Kanban columns
    priority: 'low' | 'medium' | 'high';
    dueDate?: string; 
    createdAt: string;
}