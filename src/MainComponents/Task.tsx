import { useState } from 'react';
import type { TasksProps } from '../type';
import './Task.css';

function Tasks({ tasks, loading, boardId, onCreateTask, onUpdateTask }: TasksProps) {
    const [showInput, setShowInput] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [newTaskPriority, setNewTaskPriority] = useState<'easy' | 'medium' | 'hard'>('medium');

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editStatus, setEditStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [editPriority, setEditPriority] = useState<'easy' | 'medium' | 'hard'>('medium');

    const handleCreateTask = () => {
        if (!newTaskName.trim()) return;
        onCreateTask(boardId, newTaskName, newTaskStatus, newTaskPriority);
        setNewTaskName('');
        setNewTaskStatus('backlog');
        setNewTaskPriority('medium');
        setShowInput(false);    
    };

    const handleEditTask = (taskId: number, currentStatus: string, currentPriority: string) => {
        setEditingTaskId(taskId);
        setEditStatus(currentStatus as any);
        setEditPriority(currentPriority as any);
    };

const saveEdit = (taskId: number) => {
    console.log('saveEdit вызвана для задачи:', taskId);
    onUpdateTask(taskId, editStatus, editPriority);
    setEditingTaskId(null);
};

    if (loading) return <div className="tasks-loading">Загрузка...</div>;

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <button className="tasks-add-btn" onClick={() => setShowInput(true)}>+</button>
            </div>

            {showInput && (
                <div className="tasks-input-group">
                    <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Название задачи"
                        autoFocus
                    />
                    <select value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value as any)}>
                        <option value="backlog">Бэклог</option>
                        <option value="in_progress">В работе</option>
                        <option value="review">На проверке</option>
                        <option value="done">Готово</option>
                    </select>
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)}>
                        <option value="easy">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="hard">Высокий</option>
                    </select>
                    <button onClick={handleCreateTask}>Создать</button>
                    <button onClick={() => setShowInput(false)}>Отмена</button>
                </div>
            )}

            <div className="tasks-list">
                {tasks.map((task) => (
                    <div key={task.id} className="task-item" onClick={() => handleEditTask(task.id, task.status, task.priority)}>
                        {editingTaskId === task.id ? (
                            <div className="task-edit">
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)}>
                                    <option value="backlog">Бэклог</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="review">На проверке</option>
                                    <option value="done">Готово</option>
                                </select>
                                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as any)}>
                                    <option value="easy">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="hard">Высокий</option>
                                </select>
                                <button onClick={() => saveEdit(task.id)}>Сохранить</button>
                                <button onClick={() => setEditingTaskId(null)}>Отмена</button>
                            </div>
                        ) : (
                            <>
                                <div className="task-name">{task.name}</div>
                                <div className="task-meta">
                                    <span className="task-status">{task.status}</span>
                                    <span className="task-priority">{task.priority}</span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {tasks.length === 0 && !showInput && <div className="tasks-empty">Нет задач</div>}
            </div>
        </div>
    );
}

export default Tasks;