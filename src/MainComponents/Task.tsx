import { useState } from 'react';
import './Task.css';

interface TaskDTO {
    id: number;
    name: string;
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    priority: 'easy' | 'medium' | 'hard';
}

interface TasksProps {
    tasks: TaskDTO[];
    loading?: boolean;
    boardId: number;
    onCreateTask: (boardId: number, name: string) => void;
}

function Tasks({ tasks, loading, boardId, onCreateTask }: TasksProps) {
    const [newTaskName, setNewTaskName] = useState('');

    const handleCreateTask = () => {
        console.log('📝 handleCreateTask в Tasks, newTaskName:', newTaskName);
        if (!newTaskName.trim()) {
            console.log('⚠️ Имя задачи пустое');
            return;
        }
        onCreateTask(boardId, newTaskName);
        setNewTaskName('');
    };

    console.log('🎯 Tasks рендер, задачи:', tasks);

    if (loading) return <div className="tasks-loading">Загрузка задач...</div>;

    return (
        <div className="tasks-container">
            <h3>Задачи</h3>
            
            <div className="create-task-form">
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Новая задача..."
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCreateTask();
                    }}
                />
                <button 
                    className="add-btn"
                    onClick={handleCreateTask}
                >
                    +
                </button>
            </div>

            <div className="tasks-list">
                {tasks.map(task => (
                    <div key={task.id} className={`task-item priority-${task.priority}`}>
                        <span className="task-status">[{task.status}]</span>
                        <span className="task-name">{task.name}</span>
                        <span className="task-priority">{task.priority}</span>
                    </div>
                ))}
                
                {tasks.length === 0 && (
                    <p className="empty-tasks">Нет задач. Создайте первую!</p>
                )}
            </div>
        </div>
    );
}

export default Tasks;