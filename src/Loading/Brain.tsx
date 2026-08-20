import { useState, useEffect, useRef } from 'react';
import { foldersApi, boardsApi, tasksApi } from './Api';
import Folders from '../MainComponents/Folders';
import Tasks from '../MainComponents/Task';
import type { FolderDTO, BoardDTO, TaskDTO } from '../type';
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
    
    const [activeTab, setActiveTab] = useState<'tasks' | 'overview'>('tasks');
    
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [error, setError] = useState('');
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstname, setEditFirstname] = useState('');
    const [editLastname, setEditLastname] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

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
                const tasks = await tasksApi.getByBoard(boardId, token);
                setTasksByBoard(prev => ({ ...prev, [boardId]: tasks }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingTasks(prev => ({ ...prev, [boardId]: false }));
            }
        }
        setSelectedBoardId(boardId);
        setSelectedBoardName(boardName);
        setSelectedFolderName(folderName);
    };

    const handleCreateTask = async (
        boardId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null
    ) => {
        console.log('Создаём задачу с дедлайном:', dueDate);
        try {
            await tasksApi.create(
                { name, description: ' ', priority, status, board_id: boardId, dueDate },
                token
            );
            const updatedTasks = await tasksApi.getByBoard(boardId, token);
            setTasksByBoard(prev => ({ ...prev, [boardId]: updatedTasks }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateTask = async (
        taskId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null
    ) => {
        console.log('handleUpdateTask вызвана', { taskId, name, status, priority, dueDate });
        try {
            const result = await tasksApi.update(taskId, { name, status, priority, dueDate }, token);
            console.log('Результат update:', result);
            if (selectedBoardId) {
                const updatedTasks = await tasksApi.getByBoard(selectedBoardId, token);
                setTasksByBoard(prev => ({ ...prev, [selectedBoardId]: updatedTasks }));
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
                const updatedTasks = await tasksApi.getByBoard(selectedBoardId, token);
                setTasksByBoard(prev => ({ ...prev, [selectedBoardId]: updatedTasks }));
            }
        } catch (err) {
            console.error('Ошибка удаления задачи:', err);
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