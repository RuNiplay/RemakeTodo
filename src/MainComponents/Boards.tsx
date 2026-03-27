import './Boards.css';
import type { BoardsProps } from '../type';

function Boards({ 
    boards, 
    selectedBoardId,
    onBoardClick,
    onCreateBoard 
}: BoardsProps) {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            onCreateBoard?.(e.currentTarget.value);
            e.currentTarget.value = '';
        }
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
                <div className="create-board-form">
                    <input
                        type="text"
                        placeholder="Новая доска..."
                        onKeyPress={handleKeyPress}
                    />
                    <button 
                        className="add-btn"
                        onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input?.value.trim()) {
                                onCreateBoard(input.value);
                                input.value = '';
                            }
                        }}
                    >
                        +
                    </button>
                </div>
            )}
            
            {boards.length === 0 && !onCreateBoard && (
                <p className="empty-boards">Нет досок</p>
            )}
        </div>
    );
}

export default Boards;