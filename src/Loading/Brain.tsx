import { useState, useEffect } from 'react';
import { foldersApi, boardsApi, tasksApi } from './Api';
import Folders from '../MainComponents/Folders';
import Tasks from '../MainComponents/Task';
import type { FolderDTO, BoardDTO, TaskDTO } from '../type';
import '../MainComponents/Boards.css';

function Brain() {
    // Состояния для папок
    const [folders, setFolders] = useState<FolderDTO[]>([]);
    const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
    const [boardsByFolder, setBoardsByFolder] = useState<Record<number, BoardDTO[]>>({});
    const [loadingBoards, setLoadingBoards] = useState<Record<number, boolean>>({});
    
    // Состояния для досок и задач
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
    const [selectedBoardName, setSelectedBoardName] = useState<string>('');
    const [tasksByBoard, setTasksByBoard] = useState<Record<number, TaskDTO[]>>({});
    const [loadingTasks, setLoadingTasks] = useState<Record<number, boolean>>({});
    
    // Общие состояния
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [error, setError] = useState('');
    
    const token = localStorage.getItem('token') || '';

    // Загрузка папок при монтировании
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const data = await foldersApi.getAll(token);
                console.log('Папки с сервера:', data);
                
                if (data && data.folders) {
                    setFolders(data.folders);
                } else if (Array.isArray(data)) {
                    setFolders(data);
                } else {
                    console.warn('Неожиданный формат данных:', data);
                    setFolders([]);
                }
            } catch (err) {
                console.error('Ошибка загрузки папок:', err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Произошла неизвестная ошибка');
                }
            } finally {
                setLoadingFolders(false);
            }
        };

        if (token) {
            fetchFolders();
        }
    }, [token]);

    // Загрузка досок при клике на папку
    const handleFolderClick = async (folderId: number) => {
        if (expandedFolderId === folderId) {
            setExpandedFolderId(null);
            setSelectedBoardId(null);
            setSelectedBoardName('');
            return;
        }

        if (!boardsByFolder[folderId]) {
            setLoadingBoards(prev => ({ ...prev, [folderId]: true }));
            
            try {
                const boards = await boardsApi.getByFolder(folderId, token);
                setBoardsByFolder(prev => ({ ...prev, [folderId]: boards }));
            } catch (err) {
                console.error('Ошибка загрузки досок:', err);
            } finally {
                setLoadingBoards(prev => ({ ...prev, [folderId]: false }));
            }
        }
        
        setExpandedFolderId(folderId);
        setSelectedBoardId(null);
        setSelectedBoardName('');
    };

    const handleCreateBoard = async (folderId: number, name: string) => {
        try {
            console.log('Создаем доску для папки:', folderId, 'с именем:', name);
            
            const newBoard = await boardsApi.create(
                { name, folder_id: folderId }, 
                token
            );
            
            console.log('Доска создана:', newBoard);
            
            setBoardsByFolder(prev => ({
                ...prev,
                [folderId]: [...(prev[folderId] || []), newBoard]
            }));
            
            const updatedBoards = await boardsApi.getByFolder(folderId, token);
            setBoardsByFolder(prev => ({
                ...prev,
                [folderId]: updatedBoards
            }));
            
        } catch (err) {
            console.error('Ошибка создания доски:', err);
        }
    };

    // Загрузка задач при клике на доску
    const handleBoardClick = async (boardId: number, boardName: string) => {
        console.log('🖱️ Клик по доске:', boardId, boardName);
        
        // Если доска уже выбрана — снимаем выбор
        if (selectedBoardId === boardId) {
            setSelectedBoardId(null);
            setSelectedBoardName('');
            return;
        }

        // Загружаем задачи для выбранной доски
        if (!tasksByBoard[boardId]) {
            setLoadingTasks(prev => ({ ...prev, [boardId]: true }));
            
            try {
                const tasks = await tasksApi.getByBoard(boardId, token);
                console.log('📋 Загружены задачи для доски', boardId, ':', tasks);
                setTasksByBoard(prev => ({ ...prev, [boardId]: tasks }));
            } catch (err) {
                console.error('Ошибка загрузки задач:', err);
            } finally {
                setLoadingTasks(prev => ({ ...prev, [boardId]: false }));
            }
        }
        
        setSelectedBoardId(boardId);
        setSelectedBoardName(boardName);
    };

    const handleCreateTask = async (boardId: number, name: string) => {
    console.log('📝 Создаем задачу:', { boardId, name });
    
    try {
        const newTask = await tasksApi.create(
            { 
                name, 
                description: ' ',
                priority: 'medium', 
                status: 'backlog' 
            },
            token
        );
        
        console.log('✅ Задача создана:', newTask);
        
        setTasksByBoard(prev => ({
            ...prev,
            [boardId]: [...(prev[boardId] || []), newTask]
        }));
        
    } catch (err) {
        console.error('❌ Ошибка:', err);
    }
};

    if (loadingFolders) return <div>Загрузка папок...</div>;
    if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;

    return (
        <div className="boards-container">
            <div className="main-content">
                {/* Левая колонка: папки и доски */}
                <div className="folders-column">
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

                {/* Правая колонка: название доски и задачи */}
                <div className="tasks-column">
                    {selectedBoardId ? (
                        <>
                            <h2 className="board-title">{selectedBoardName}</h2>
                            <Tasks 
                                tasks={tasksByBoard[selectedBoardId] || []}
                                loading={loadingTasks[selectedBoardId]}
                                boardId={selectedBoardId}
                                onCreateTask={handleCreateTask}
                            />
                        </>
                    ) : (
                        <div className="empty-selection">
                            <p>Выберите доску, чтобы увидеть задачи</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Brain;