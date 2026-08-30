import { useState, useEffect } from 'react';
import type { TaskDTO, CommentDTO } from '../type';
import { commentsApi } from '../Loading/Api';
import './Discussions.css';

interface DiscussionsProps {
    tasks: TaskDTO[];
    token: string;
}

function Discussions({ tasks, token }: DiscussionsProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedTaskName, setSelectedTaskName] = useState<string>('');
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Только что';
        }
    };

    const getCurrentDate = () => {
        return new Date().toISOString();
    };

    useEffect(() => {
        if (!selectedTaskId) {
            setComments([]);
            return;
        }

        const loadComments = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await commentsApi.getByTask(selectedTaskId, token);
                console.log('Комментарии от бэкенда:', data);
                setComments(data);
            } catch (err) {
                setError('Не удалось загрузить обсуждения');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadComments();
    }, [selectedTaskId, token]);

    const handleTaskClick = (taskId: number, taskName: string) => {
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null);
            setSelectedTaskName('');
            return;
        }
        setSelectedTaskId(taskId);
        setSelectedTaskName(taskName);
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !selectedTaskId) return;

        try {
            const created = await commentsApi.create(
                { message: newComment.trim(), task_id: selectedTaskId },
                token
            );

            // Проверяем, что комментарий создался
            if (!created || !created.id) {
                console.error('Ошибка: комментарий не создан', created);
                setError('Не удалось создать комментарий');
                return;
            }

            const commentWithDate = {
                ...created,
                created_at: created.created_at || getCurrentDate()
            };

            setComments(prev => [...prev, commentWithDate]);
            setNewComment('');
        } catch (err) {
            setError('Не удалось отправить комментарий');
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Удалить этот комментарий?')) return;

        try {
            await commentsApi.delete(commentId, token);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            setError('Не удалось удалить комментарий');
            console.error(err);
        }
    };

    return (
        <div className="discussions-container">
            <div className="discussions-task-list">
                <h3 className="discussions-list-title">Выберите задачу</h3>
                <div className="discussions-tasks">
                    {tasks.length === 0 ? (
                        <div className="discussions-empty-tasks">Нет задач</div>
                    ) : (
                        tasks.map(task => (
                            <div
                                key={task.id}
                                className={`discussions-task-item ${selectedTaskId === task.id ? 'active' : ''}`}
                                onClick={() => handleTaskClick(task.id, task.name)}
                            >
                                <span className="discussions-task-name">{task.name}</span>
                                <span className="discussions-task-status">{task.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="discussions-panel">
                {selectedTaskId ? (
                    <>
                        <div className="discussions-header">
                            <h3 className="discussions-title">Обсуждения: {selectedTaskName}</h3>
                        </div>

                        {error && <div className="discussions-error">{error}</div>}

                        <div className="discussions-messages">
                            {loading ? (
                                <div className="discussions-loading">Загрузка...</div>
                            ) : comments.length === 0 ? (
                                <div className="discussions-empty">Нет комментариев. Начните обсуждение!</div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="discussions-message">
                                        <div className="discussions-message-avatar">
                                            {comment.author_id ? comment.author_id.toString().charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="discussions-message-body">
                                            <div className="discussions-message-header">
                                                <span className="discussions-message-author">
                                                    Пользователь #{comment.author_id || '?'}
                                                </span>
                                                <span className="discussions-message-date">
                                                    {comment.created_at ? formatDate(comment.created_at) : 'Только что'}
                                                </span>
                                            </div>
                                            <div className="discussions-message-text">
    {comment.Message || 'Без текста'}
</div>
                                        </div>
                                        <button
                                            className="discussions-message-delete"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            title="Удалить"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="discussions-input-area">
                            <textarea
                                className="discussions-input"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Напишите комментарий..."
                                rows={2}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendComment();
                                    }
                                }}
                            />
                            <button
                                className="discussions-send-btn"
                                onClick={handleSendComment}
                                disabled={!newComment.trim()}
                            >
                                Отправить
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="discussions-empty-state">
                        <p>Выберите задачу слева, чтобы увидеть обсуждения</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Discussions;