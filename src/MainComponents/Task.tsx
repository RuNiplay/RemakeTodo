import { useState } from 'react';
import type { TasksProps } from '../type';
import './Task.css';

function Tasks({ tasks, loading, boardId, onCreateTask, onUpdateTask, onDeleteTask }: TasksProps) {
    const [showInput, setShowInput] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [newTaskPriority, setNewTaskPriority] = useState<'easy' | 'medium' | 'hard'>('medium');

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editName, setEditName] = useState<string>('');
    const [editStatus, setEditStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [editPriority, setEditPriority] = useState<'easy' | 'medium' | 'hard'>('medium');

    const groupedTasks = {
        backlog: tasks.filter(t => t.status === 'backlog'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        review: tasks.filter(t => t.status === 'review'),
        done: tasks.filter(t => t.status === 'done'),
    };

    const columnConfig = [
        { key: 'backlog', title: 'Бэклог' },
        { key: 'in_progress', title: 'В работе' },
        { key: 'review', title: 'На проверке' },
        { key: 'done', title: 'Готово' },
    ];

    const handleCreateTask = () => {
        if (!newTaskName.trim()) return;
        onCreateTask(boardId, newTaskName, newTaskStatus, newTaskPriority);
        setNewTaskName('');
        setNewTaskStatus('backlog');
        setNewTaskPriority('medium');
        setShowInput(false);
    };

    const handleEditTask = (taskId: number, currentName: string, currentStatus: string, currentPriority: string) => {
        setEditingTaskId(taskId);
        setEditName(currentName);
        setEditStatus(currentStatus as any);
        setEditPriority(currentPriority as any);
    };

    const saveEdit = (taskId: number) => {
        onUpdateTask(taskId, editName, editStatus, editPriority);
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

            <div className="tasks-board">
                {columnConfig.map((column) => (
                    <div key={column.key} className="tasks-column">
                        <div className="column-header">
                            <span>{column.title}</span>
                            <span>{groupedTasks[column.key as keyof typeof groupedTasks].length}</span>
                        </div>
                        <div className="tasks-list">
                            {groupedTasks[column.key as keyof typeof groupedTasks].map((task) => (
                                <div
                                    key={`task-${task.id}`}
                                    className="task-item"
                                    onClick={() => handleEditTask(task.id, task.name, task.status, task.priority)}
                                >
                                    {editingTaskId === task.id ? (
                                        <div className="task-edit" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                            <select
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value as any)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="backlog">Бэклог</option>
                                                <option value="in_progress">В работе</option>
                                                <option value="review">На проверке</option>
                                                <option value="done">Готово</option>
                                            </select>
                                            <select
                                                value={editPriority}
                                                onChange={(e) => setEditPriority(e.target.value as any)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="easy">Низкий</option>
                                                <option value="medium">Средний</option>
                                                <option value="hard">Высокий</option>
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    saveEdit(task.id);
                                                }}
                                            >
                                                Сохранить
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTaskId(null);
                                                }}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="task-name">{task.name}</div>
                                            <div className="task-meta">
                                                <span className="task-status">{task.status}</span>
                                                <span className="task-priority">{task.priority}</span>
                                            </div>
                                            <button
                                                className="task-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Удалить задачу?')) {
                                                        onDeleteTask(task.id);
                                                    }
                                                }}
                                            >
                                                🗑
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                            {groupedTasks[column.key as keyof typeof groupedTasks].length === 0 && (
                                <div className="empty-column">Нет задач</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tasks;