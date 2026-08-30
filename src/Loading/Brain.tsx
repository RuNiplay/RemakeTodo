import { useState, useEffect, useRef } from 'react';
import { foldersApi, boardsApi, tasksApi, subtasksApi } from './Api';
import Folders from '../MainComponents/Folders';
import Tasks from '../MainComponents/Task';
import Discussions from '../MainComponents/Discussions';
import type { FolderDTO, BoardDTO, TaskDTO, SubtaskDTO } from '../type';
import './Brain.css';

function Brain() {
    const [folders, setFolders] = useState<FolderDTO[]>([]);
    const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
    const [boardsByFolder, setBoardsByFolder] = useState<Record<number, BoardDTO[]>>({});
    const [loadingBoards, setLoadingBoards] = useState<Record<number, boolean>>({});
    
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
    const [selectedBoardName, setSelectedBoardName] = useState<string>('');
    const [selectedFolderName, setSelectedFolderName] = useState<string>('');
    const [tasksByBoard, setTasksByBoard] = useState<Record<number, TaskDTO[]>>({});
    const [loadingTasks, setLoadingTasks] = useState<Record<number, boolean>>({});
    
    const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'subtasks' | 'discussions'>('tasks');
    
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [error, setError] = useState('');
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstname, setEditFirstname] = useState('');
    const [editLastname, setEditLastname] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedTaskName, setSelectedTaskName] = useState<string>('');
    const [subtasksByTask, setSubtasksByTask] = useState<Record<number, SubtaskDTO[]>>({});
    const [loadingSubtasks, setLoadingSubtasks] = useState<Record<number, boolean>>({});

    const token = localStorage.getItem('token') || '';
    const username = localStorage.getItem('username') || 'Не указан';
    const firstname = localStorage.getItem('firstname') || '';
    const lastname = localStorage.getItem('lastname') || '';
    const displayName = firstname || lastname || username;

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const data = await foldersApi.getAll(token);
                if (data && data.folders) {
                    setFolders(data.folders);
                } else if (Array.isArray(data)) {
                    setFolders(data);
                } else {
                    setFolders([]);
                }
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError('Произошла неизвестная ошибка');
            } finally {
                setLoadingFolders(false);
            }
        };
        if (token) fetchFolders();
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setIsEditing(false);
                setProfileMessage('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTasksCountByStatusAndPriority = (status: string, priority: string) => {
        return tasksByBoard[selectedBoardId!]?.filter(
            t => t.status === status && t.priority === priority
        ).length || 0;
    };

    const getTasksCountByStatus = (status: string) => {
        return tasksByBoard[selectedBoardId!]?.filter(t => t.status === status).length || 0;
    };

    const loadTasksWithDetails = async (boardId: number): Promise<TaskDTO[]> => {
        const tasksList = await tasksApi.getByBoard(boardId, token);
        
        const tasksWithDetails = await Promise.all(
            tasksList.map(async (task) => {
                try {
                    const detailed = await tasksApi.getById(task.id, token);
                    return {
                        ...task,
                        dueDate: detailed.dueDate || null,
                        comments: detailed.comments || [],
                        subtasks: detailed.subtasks || [],
                    };
                } catch {
                    return task;
                }
            })
        );
        
        return tasksWithDetails;
    };

    const handleFolderClick = async (folderId: number) => {
        if (expandedFolderId === folderId) {
            setExpandedFolderId(null);
            setSelectedBoardId(null);
            setSelectedBoardName('');
            setSelectedFolderName('');
            return;
        }
        if (!boardsByFolder[folderId]) {
            setLoadingBoards(prev => ({ ...prev, [folderId]: true }));
            try {
                const boards = await boardsApi.getByFolder(folderId, token);
                setBoardsByFolder(prev => ({ ...prev, [folderId]: boards }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingBoards(prev => ({ ...prev, [folderId]: false }));
            }
        }
        setExpandedFolderId(folderId);
        setSelectedBoardId(null);
        setSelectedBoardName('');
        setSelectedFolderName('');
    };

    const handleCreateBoard = async (folderId: number, name: string) => {
        try {
            const newBoard = await boardsApi.create({ name, folder_id: folderId }, token);
            setBoardsByFolder(prev => ({
                ...prev,
                [folderId]: [...(prev[folderId] || []), newBoard]
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleBoardClick = async (boardId: number, boardName: string, folderName: string) => {
        if (selectedBoardId === boardId) {
            setSelectedBoardId(null);
            setSelectedBoardName('');
            setSelectedFolderName('');
            return;
        }

        if (!tasksByBoard[boardId]) {
            setLoadingTasks(prev => ({ ...prev, [boardId]: true }));
            try {
                const tasksWithDetails = await loadTasksWithDetails(boardId);
                setTasksByBoard(prev => ({ ...prev, [boardId]: tasksWithDetails }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingTasks(prev => ({ ...prev, [boardId]: false }));
            }
        }

        setSelectedBoardId(boardId);
        setSelectedBoardName(boardName);
        setSelectedFolderName(folderName);
        setActiveTab('tasks');
        setSelectedTaskId(null);
    };

    const handleCreateTask = async (
        boardId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null,
        description?: string | null 
    ) => {
        console.log('Создаём задачу с дедлайном:', dueDate);
        try {
            await tasksApi.create(
                { name, description: description || ' ', priority, status, board_id: boardId, dueDate },
                token
            );
            const tasksWithDetails = await loadTasksWithDetails(boardId);
            setTasksByBoard(prev => ({ ...prev, [boardId]: tasksWithDetails }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateTask = async (
        taskId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null,
        description?: string | null
    ) => {
        console.log('handleUpdateTask вызвана', { taskId, name, status, priority, dueDate, description });
        try {
            await tasksApi.update(taskId, { 
                name, 
                status, 
                priority, 
                dueDate,
                description: description || ' '
            }, token);

            if (selectedBoardId) {
                const tasksWithDetails = await loadTasksWithDetails(selectedBoardId);
                setTasksByBoard(prev => ({ ...prev, [selectedBoardId]: tasksWithDetails }));
            }
        } catch (err) {
            console.error('Ошибка обновления задачи:', err);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        console.log('Удаление задачи:', taskId);
        try {
            await tasksApi.delete(taskId, token);
            if (selectedBoardId) {
                const tasksWithDetails = await loadTasksWithDetails(selectedBoardId);
                setTasksByBoard(prev => ({ ...prev, [selectedBoardId]: tasksWithDetails }));
            }
        } catch (err) {
            console.error('Ошибка удаления задачи:', err);
        }
    };

    const loadSubtasks = async (taskId: number) => {
        if (subtasksByTask[taskId]) return;
        setLoadingSubtasks(prev => ({ ...prev, [taskId]: true }));
        try {
            const subtasks = await subtasksApi.getByTask(taskId, token);
            setSubtasksByTask(prev => ({ ...prev, [taskId]: subtasks }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubtasks(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const handleTaskClick = (taskId: number, taskName: string) => {
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null);
            setSelectedTaskName('');
            return;
        }
        setSelectedTaskId(taskId);
        setSelectedTaskName(taskName);
        loadSubtasks(taskId);
    };

    const handleCreateSubtask = async (taskId: number, name: string) => {
        try {
            await subtasksApi.create({ name, task_id: taskId }, token);
            const updated = await subtasksApi.getByTask(taskId, token);
            setSubtasksByTask(prev => ({ ...prev, [taskId]: updated }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSubtask = async (subtaskId: number, data: { name?: string; completed?: boolean }) => {
        try {
            // Если меняем только completed — добавляем текущее имя
            let updateData = { ...data };
            
            if (data.completed !== undefined && !data.name) {
                const currentSubtasks = subtasksByTask[selectedTaskId!] || [];
                const subtask = currentSubtasks.find(s => s.id === subtaskId);
                if (subtask) {
                    updateData = { ...data, name: subtask.name };
                }
            }
            
            await subtasksApi.update(subtaskId, updateData, token);
            if (selectedTaskId) {
                const updated = await subtasksApi.getByTask(selectedTaskId, token);
                setSubtasksByTask(prev => ({ ...prev, [selectedTaskId]: updated }));
            }
        } catch (err) {
            console.error('Ошибка обновления подзадачи:', err);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        try {
            await subtasksApi.delete(subtaskId, token);
            if (selectedTaskId) {
                const updated = await subtasksApi.getByTask(selectedTaskId, token);
                setSubtasksByTask(prev => ({ ...prev, [selectedTaskId]: updated }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('firstname');
        localStorage.removeItem('lastname');
        window.location.href = '/login';
    };

    const handleSaveProfile = () => {
        if (editFirstname) localStorage.setItem('firstname', editFirstname);
        if (editLastname) localStorage.setItem('lastname', editLastname);
        setProfileMessage('✅ Данные сохранены!');
        setIsEditing(false);
        setTimeout(() => setProfileMessage(''), 3000);
    };

    const handleChangePassword = async () => {
        if (!editPassword || editPassword.length < 7) {
            setProfileMessage('❌ Пароль должен быть не менее 7 символов');
            return;
        }
        try {
            setProfileMessage('✅ Пароль изменён!');
            setEditPassword('');
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (err) {
            setProfileMessage('❌ Ошибка смены пароля');
        }
    };

    if (loadingFolders) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;

    return (
        <div className="brain-container">
            <div className="brain-sidebar">
                <div className="avatar-container">
                    <div className="avatar-wrapper" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <div className="avatar">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="avatar-name">{displayName}</span>
                    </div>
                </div>

                <Folders 
                    folders={folders}
                    setFolders={setFolders}
                    token={token}
                    expandedFolderId={expandedFolderId}
                    boardsByFolder={boardsByFolder}
                    loadingBoards={loadingBoards}
                    onFolderClick={handleFolderClick}
                    onCreateBoard={handleCreateBoard}
                    onBoardClick={handleBoardClick}
                    selectedBoardId={selectedBoardId}
                />

                {isProfileOpen && (
                    <div className="profile-dropdown" ref={menuRef}>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="profile-info">
                                <div className="profile-name">{displayName}</div>
                                <div className="profile-username">@{username}</div>
                            </div>
                        </div>

                        {profileMessage && (
                            <div className="profile-message">{profileMessage}</div>
                        )}

                        {!isEditing ? (
                            <>
                                <button className="profile-btn" onClick={() => setIsEditing(true)}>
                                    ✏️ Редактировать профиль
                                </button>
                                <button className="profile-btn" onClick={() => setIsEditing(true)}>
                                    🔑 Сменить пароль
                                </button>
                            </>
                        ) : (
                            <div className="profile-edit">
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    value={editFirstname}
                                    onChange={(e) => setEditFirstname(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Фамилия"
                                    value={editLastname}
                                    onChange={(e) => setEditLastname(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Новый пароль (мин. 7 символов)"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                />
                                <div className="profile-edit-actions">
                                    <button className="profile-btn save" onClick={handleSaveProfile}>
                                        Сохранить
                                    </button>
                                    <button className="profile-btn cancel" onClick={() => {
                                        setIsEditing(false);
                                        setEditPassword('');
                                        setProfileMessage('');
                                    }}>
                                        Отмена
                                    </button>
                                </div>
                                {editPassword && (
                                    <button className="profile-btn password-change" onClick={handleChangePassword}>
                                        Сменить пароль
                                    </button>
                                )}
                            </div>
                        )}

                        <button className="profile-btn logout" onClick={handleLogout}>
                            🚪 Выйти
                        </button>
                    </div>
                )}
            </div>
            <div className="brain-main">
                {selectedBoardId ? (
                    <div className="brain-card">
                        <div className="brain-breadcrumb">
                            <span className="breadcrumb-text">Проекты / {selectedFolderName}</span>
                        </div>
                        <div className="brain-card-header">
                            <span className="board-indicator"></span>
                            <h1 className="brain-card-title">{selectedBoardName}</h1>
                        </div>
                        
                        <div className="board-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tasks')}
                            >
                                Задачи
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Обзор
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'subtasks' ? 'active' : ''}`}
                                onClick={() => setActiveTab('subtasks')}
                            >
                                Подзадачи
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('discussions')}
                            >
                                Обсуждения
                            </button>
                        </div>

                        {activeTab === 'tasks' && (
                            <Tasks 
                                tasks={tasksByBoard[selectedBoardId] || []}
                                loading={loadingTasks[selectedBoardId]}
                                boardId={selectedBoardId}
                                onCreateTask={handleCreateTask}
                                onUpdateTask={handleUpdateTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        )}

                        {activeTab === 'overview' && (
                            <>
                                <div className="board-overview">
                                    <div className="status-card">
                                        <span className="status-card-title">Бэклог</span>
                                        <span className="status-card-count">{getTasksCountByStatus('backlog')} задач</span>
                                        <div className="status-card-divider"></div>
                                        <div className="status-card-priorities">
                                            <span className="priority-badge low">Низ: {getTasksCountByStatusAndPriority('backlog', 'easy')}</span>
                                            <span className="priority-badge medium">Сред: {getTasksCountByStatusAndPriority('backlog', 'medium')}</span>
                                            <span className="priority-badge high">Выс: {getTasksCountByStatusAndPriority('backlog', 'hard')}</span>
                                        </div>
                                    </div>

                                    <div className="status-card">
                                        <span className="status-card-title">В работе</span>
                                        <span className="status-card-count">{getTasksCountByStatus('in_progress')} задач</span>
                                        <div className="status-card-divider"></div>
                                        <div className="status-card-priorities">
                                            <span className="priority-badge low">Низ: {getTasksCountByStatusAndPriority('in_progress', 'easy')}</span>
                                            <span className="priority-badge medium">Сред: {getTasksCountByStatusAndPriority('in_progress', 'medium')}</span>
                                            <span className="priority-badge high">Выс: {getTasksCountByStatusAndPriority('in_progress', 'hard')}</span>
                                        </div>
                                    </div>

                                    <div className="status-card">
                                        <span className="status-card-title">На проверке</span>
                                        <span className="status-card-count">{getTasksCountByStatus('review')} задач</span>
                                        <div className="status-card-divider"></div>
                                        <div className="status-card-priorities">
                                            <span className="priority-badge low">Низ: {getTasksCountByStatusAndPriority('review', 'easy')}</span>
                                            <span className="priority-badge medium">Сред: {getTasksCountByStatusAndPriority('review', 'medium')}</span>
                                            <span className="priority-badge high">Выс: {getTasksCountByStatusAndPriority('review', 'hard')}</span>
                                        </div>
                                    </div>

                                    <div className="status-card">
                                        <span className="status-card-title">Готово</span>
                                        <span className="status-card-count">{getTasksCountByStatus('done')} задач</span>
                                        <div className="status-card-divider"></div>
                                        <div className="status-card-priorities">
                                            <span className="priority-badge low">Низ: {getTasksCountByStatusAndPriority('done', 'easy')}</span>
                                            <span className="priority-badge medium">Сред: {getTasksCountByStatusAndPriority('done', 'medium')}</span>
                                            <span className="priority-badge high">Выс: {getTasksCountByStatusAndPriority('done', 'hard')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="board-info-card">
                                    <div className="board-info-header">
                                        <h3>Информация о доске</h3>
                                    </div>
                                    <div className="board-info-row">
                                        <span className="board-info-label">Владелец:</span>
                                        <span className="board-info-value">{username}</span>
                                    </div>
                                    <div className="board-info-row">
                                        <span className="board-info-label">Создано:</span>
                                        <span className="board-info-value">—</span>
                                    </div>
                                    <div className="board-info-row">
                                        <span className="board-info-label">Срок:</span>
                                        <span className="board-info-value">—</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'subtasks' && (
                            <div className="subtasks-container">
                                <div className="task-selector">
                                    <h3>Выберите задачу</h3>
                                    <div className="task-list-mini">
                                        {(tasksByBoard[selectedBoardId] || []).length === 0 ? (
                                            <div className="empty-tasks-mini">Нет задач</div>
                                        ) : (
                                            (tasksByBoard[selectedBoardId] || []).map(task => (
                                                <div 
                                                    key={task.id}
                                                    className={`task-mini-item ${selectedTaskId === task.id ? 'active' : ''}`}
                                                    onClick={() => handleTaskClick(task.id, task.name)}
                                                >
                                                    <span className="task-mini-name">{task.name}</span>
                                                    <span className="task-mini-status">{task.status}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {selectedTaskId ? (
                                    <div className="subtasks-board">
                                        <div className="subtasks-header">
                                            <h3>Подзадачи: {selectedTaskName}</h3>
                                            <div className="subtasks-add">
                                                <input 
                                                    type="text" 
                                                    placeholder="Название подзадачи"
                                                    id="newSubtaskInput"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const input = e.target as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                handleCreateSubtask(selectedTaskId, input.value);
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const input = document.getElementById('newSubtaskInput') as HTMLInputElement;
                                                        if (input?.value.trim()) {
                                                            handleCreateSubtask(selectedTaskId, input.value);
                                                            input.value = '';
                                                        }
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {loadingSubtasks[selectedTaskId] ? (
                                            <div className="subtasks-loading">Загрузка...</div>
                                        ) : (
                                            <div className="subtasks-list">
                                                {(subtasksByTask[selectedTaskId] || []).length === 0 ? (
                                                    <div className="empty-subtasks">Нет подзадач</div>
                                                ) : (
                                                    (subtasksByTask[selectedTaskId] || []).map(subtask => (
                                                        <div key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={subtask.completed}
                                                                onChange={() => handleUpdateSubtask(subtask.id, { completed: !subtask.completed })}
                                                            />
                                                            <span className="subtask-name">{subtask.name}</span>
                                                            <button 
                                                                className="subtask-delete"
                                                                onClick={() => handleDeleteSubtask(subtask.id)}
                                                            >
                                                                🗑
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="subtasks-empty-state">
                                        <p>Выберите задачу слева, чтобы увидеть её подзадачи</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'discussions' && (
                            <Discussions
                                tasks={tasksByBoard[selectedBoardId] || []}
                                token={token}
                            />
                        )}
                    </div>
                ) : (
                    <div className="brain-empty">
                        <p>Выберите доску, чтобы увидеть задачи</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Brain;