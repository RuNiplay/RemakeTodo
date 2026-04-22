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

    // ========== ДОБАВЛЕНА ФУНКЦИЯ ОБНОВЛЕНИЯ ЗАДАЧИ ==========
    const handleUpdateTask = async (
        taskId: number,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard'
    ) => {
        try {
            await tasksApi.update(taskId, { status, priority }, token);
            if (selectedBoardId) {
                const updatedTasks = await tasksApi.getByBoard(selectedBoardId, token);
                setTasksByBoard(prev => ({ ...prev, [selectedBoardId]: updatedTasks }));
            }
        } catch (err) {
            console.error('Ошибка обновления задачи:', err);
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
                        <Tasks 
                            tasks={tasksByBoard[selectedBoardId] || []}
                            loading={loadingTasks[selectedBoardId]}
                            boardId={selectedBoardId}
                            onCreateTask={handleCreateTask}
                            onUpdateTask={handleUpdateTask}
                        />
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