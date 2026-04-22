import { useState } from 'react';
import { foldersApi } from '../Loading/Api';
import Boards from './Boards';
import './Folders.css';
import type { FolderListProps } from '../type';

function Folders({ 
    folders, 
    setFolders, 
    token,
    expandedFolderId,
    boardsByFolder,
    loadingBoards,
    onFolderClick,
    onCreateBoard,
    onBoardClick,
    selectedBoardId
}: FolderListProps) {
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    const createFolder = async () => {
        if (!newName.trim()) return;
        setLoading(true);
        
        try {
            await foldersApi.create({ name: newName }, token);
            const data = await foldersApi.getAll(token);
            setFolders(data.folders || []);
            setNewName('');
            setShowCreate(false);
        } catch (err) {
            console.error('❌ Ошибка создания папки:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="folders-section">
            <div className="folders-header">
                <h3>Проекты</h3>
                <button onClick={() => setShowCreate(true)}>+</button>
            </div>

            {showCreate && (
                <div className="create-folder-form">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Название папки"
                        disabled={loading}
                    />
                    <button onClick={createFolder} disabled={loading}>
                        {loading ? 'Создание...' : 'Создать'}
                    </button>
                    <button onClick={() => setShowCreate(false)}>Отмена</button>
                </div>
            )}

            <div className="folders-list">
                {folders.map(folder => (
                    <div key={folder.id} className="folder-item">
                        <div 
                            className="folder-header"
                            onClick={() => onFolderClick(folder.id)}
                        >
                            <span className="folder-icon">
                                {expandedFolderId === folder.id ? '📂' : '📁'}
                            </span>
                            <span className="folder-name">{folder.name}</span>
                        </div>

                        {expandedFolderId === folder.id && (
                            <div className="boards-inside-folder">
                                {loadingBoards[folder.id] ? (
                                    <div className="loading-boards">Загрузка...</div>
                                ) : (
                                    <Boards 
                                        boards={boardsByFolder[folder.id] || []}
                                        selectedBoardId={selectedBoardId}
                                        onBoardClick={(boardId) => {
    const board = (boardsByFolder[folder.id] || []).find(b => b.id === boardId);
    if (board) {
        onBoardClick(boardId, board.name, folder.name);
    }
}}
                                        onCreateBoard={(name) => {
                                            if (name?.trim()) onCreateBoard(folder.id, name);
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
                
                {folders.length === 0 && (
                    <p className="empty-message">У вас пока нет папок. Создайте первую!</p>
                )}
            </div>
        </div>
    );
}

export default Folders;