import './Boards.css';
import type { BoardsProps } from '../type';
import { useState } from 'react';

function Boards({ 
    boards, 
    selectedBoardId,
    onBoardClick,
    onCreateBoard 
}: BoardsProps) {
    const [showInput, setShowInput] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = () => {
        if (!newName.trim()) return;
        onCreateBoard?.(newName);
        setNewName('');
        setShowInput(false);
    };

    return (
        <div className="boards-list">
            {boards.map(board => (
                <div 
                    key={board.id} 
                    className={`board-item ${selectedBoardId === board.id ? 'selected' : ''}`}
                    onClick={() => onBoardClick?.(board.id)}
                >
                    <span className="board-icon">📋</span>
                    <span className="board-name">{board.name}</span>
                </div>
            ))}
            
            {onCreateBoard && (
                <div className="boards-footer">
                    <button 
                        className="boards-add-btn"
                        onClick={() => setShowInput(true)}
                    >
                        +
                    </button>
                    {showInput && (
                        <div className="boards-input-group">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Название доски"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                            />
                            <button onClick={handleCreate}>Создать</button>
                            <button onClick={() => setShowInput(false)}>Отмена</button>
                        </div>
                    )}
                </div>
            )}
            
            {boards.length === 0 && !onCreateBoard && (
                <p className="empty-boards">Нет досок</p>
            )}
        </div>
    );
}

export default Boards;