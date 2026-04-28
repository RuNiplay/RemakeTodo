import { useState, useEffect } from 'react';
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
    
    const token = localStorage.getItem('token') || '';

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
        priority: 'easy' | 'medium' | 'hard'
    ) => {
        try {
            await tasksApi.create(
                { name, description: ' ', priority, status, board_id: boardId },
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
        priority: 'easy' | 'medium' | 'hard'
    ) => {
        console.log('handleUpdateTask вызвана', { taskId, name, status, priority });
        try {
            const result = await tasksApi.update(taskId, { name, status, priority }, token);
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

    if (loadingFolders) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;

    return (
        <div className="brain-container">
            <div className="brain-sidebar">
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