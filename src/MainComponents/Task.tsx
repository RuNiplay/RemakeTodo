import { useState } from 'react';
import type { TasksProps } from '../type';
import './Task.css';

function Tasks({ tasks, loading, boardId, onCreateTask, onUpdateTask, onDeleteTask }: TasksProps) {
    const [showInput, setShowInput] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [newTaskPriority, setNewTaskPriority] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
    const [newTaskDescription, setNewTaskDescription] = useState<string>('');

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editName, setEditName] = useState<string>('');
    const [editStatus, setEditStatus] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
    const [editPriority, setEditPriority] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [editDueDate, setEditDueDate] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');

    const [filterPriority, setFilterPriority] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [filterSort, setFilterSort] = useState<'none' | 'dueDate' | 'priority'>('none');

    const getFilteredTasks = (status: string) => {
        let filtered = tasks.filter(t => t.status === status);

        if (filterPriority !== 'all') {
            filtered = filtered.filter(t => t.priority === filterPriority);
        }

        if (filterSort === 'dueDate') {
            filtered = [...filtered].sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
        } else if (filterSort === 'priority') {
            const priorityOrder = { hard: 0, medium: 1, easy: 2 };
            filtered = [...filtered].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        return filtered;
    };

    const groupedTasks = {
        backlog: getFilteredTasks('backlog'),
        in_progress: getFilteredTasks('in_progress'),
        review: getFilteredTasks('review'),
        done: getFilteredTasks('done'),
    };

    const columnConfig = [
        { key: 'backlog', title: 'Бэклог' },
        { key: 'in_progress', title: 'В работе' },
        { key: 'review', title: 'На проверке' },
        { key: 'done', title: 'Готово' },
    ];

    const isUrgent = (dueDate: string): boolean => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const handleCreateTaskForColumn = (status: string) => {
        setNewTaskStatus(status as any);
        setShowInput(true);
    };

    const handleCreateTask = () => {
        if (!newTaskName.trim()) return;
        onCreateTask(boardId, newTaskName, newTaskStatus, newTaskPriority, newTaskDueDate || null, newTaskDescription || null);
        setNewTaskName('');
        setNewTaskStatus('backlog');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setNewTaskDescription('');
        setShowInput(false);
    };

    const handleEditTask = (taskId: number, currentName: string, currentStatus: string, currentPriority: string, currentDueDate?: string | null, currentDescription?: string | null) => {
        setEditingTaskId(taskId);
        setEditName(currentName);
        setEditStatus(currentStatus as any);
        setEditPriority(currentPriority as any);
        setEditDueDate(currentDueDate || '');
        setEditDescription(currentDescription || '');
    };

    const saveEdit = (taskId: number) => {
        onUpdateTask(taskId, editName, editStatus, editPriority, editDueDate || null, editDescription || null);
        setEditingTaskId(null);
    };

    if (loading) return <div className="tasks-loading">Загрузка...</div>;

    return (
        <div className="tasks-container">
            {/* Панель фильтров */}
            <div className="tasks-filters">
                <div className="filter-group">
                    <span className="filter-label">Приоритет:</span>
                    <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="all">Все</option>
                        <option value="easy">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="hard">Высокий</option>
                    </select>
                </div>
                <div className="filter-group">
                    <span className="filter-label">Сортировка:</span>
                    <select 
                        value={filterSort} 
                        onChange={(e) => setFilterSort(e.target.value as any)}
                        className="filter-select"
                    >
                        <option value="none">Без сортировки</option>
                        <option value="dueDate">По дедлайну</option>
                        <option value="priority">По приоритету</option>
                    </select>
                </div>
                {(filterPriority !== 'all' || filterSort !== 'none') && (
                    <button 
                        className="filter-reset-btn"
                        onClick={() => {
                            setFilterPriority('all');
                            setFilterSort('none');
                        }}
                    >
                        Сбросить
                    </button>
                )}
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
                    <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                    <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Описание задачи"
                        rows={2}
                    />
                    <button onClick={handleCreateTask}>Создать</button>
                    <button onClick={() => setShowInput(false)}>Отмена</button>
                </div>
            )}

            <div className="tasks-board">
                {columnConfig.map((column) => (
                    <div key={column.key} className="tasks-column">
                        <div className="column-header">
                            <div className="column-header-left">
                                <span>{column.title}</span>
                                <span className="column-count">{groupedTasks[column.key as keyof typeof groupedTasks].length}</span>
                            </div>
                            <button 
                                className="column-add-btn"
                                onClick={() => handleCreateTaskForColumn(column.key)}
                            >
                                +
                            </button>
                        </div>
                        <div className="tasks-list">
                            {groupedTasks[column.key as keyof typeof groupedTasks].length === 0 && (
                                <div className="empty-column">Нет задач</div>
                            )}
                            {groupedTasks[column.key as keyof typeof groupedTasks].map((task) => (
                                <div
                                    key={`task-${task.id}`}
                                    className={`task-item priority-${task.priority}`}
                                    onClick={() => handleEditTask(task.id, task.name, task.status, task.priority, task.dueDate, task.description)}
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
                                            <input
                                                type="date"
                                                value={editDueDate}
                                                onChange={(e) => setEditDueDate(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Описание задачи"
                                                rows={2}
                                                onClick={(e) => e.stopPropagation()}
                                            />
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
                                            <div className="task-header">
                                                <span className="task-priority-badge">
                                                    {task.priority === 'easy' && 'Низкий'}
                                                    {task.priority === 'medium' && 'Средний'}
                                                    {task.priority === 'hard' && 'Высокий'}
                                                </span>
                                            </div>
                                            <div className="task-name">{task.name}</div>
                                            {task.description && (
                                                <div className="task-description">{task.description}</div>
                                            )}
                                            {task.dueDate && (
                                                <div className={`task-due-date ${isUrgent(task.dueDate) ? 'urgent' : ''}`}>
                                                    📅 {formatDate(task.dueDate)}
                                                    {isUrgent(task.dueDate) && ' ⚠️'}
                                                </div>
                                            )}
                                            <div className="task-footer">
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
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tasks;