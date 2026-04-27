import type { 
    GetAllFoldersResponse, 
    CreateFolderRequest, 
    FolderDTO,
    BoardDTO,
    CreateBoardRequest,
    TaskDTO,
    CreateTaskRequest,
    CommentDTO,
    CreateCommentRequest,
    SubtaskDTO,
    CreateSubtaskRequest
} from '../type';

const API_BASE_URL = 'http://185.207.64.215:8080/api/v1';

const getHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
});

export const foldersApi = {
    getAll: async (token: string): Promise<GetAllFoldersResponse> => {
        const res = await fetch(`${API_BASE_URL}/folders`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки папок');
        }

        const json = await res.json();
        return { folders: json.data || [] };
    },

    create: async (data: CreateFolderRequest, token: string): Promise<FolderDTO> => {
        const res = await fetch(`${API_BASE_URL}/folders`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка создания папки');
        }

        const json = await res.json();
        return json.data || json;
    }
};

export const boardsApi = {
    getByFolder: async (folderId: number, token: string): Promise<BoardDTO[]> => {
        const res = await fetch(`${API_BASE_URL}/boards?folder_id=${folderId}`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки досок');
        }

        const json = await res.json();
        return json.data || [];
    },

    create: async (data: CreateBoardRequest, token: string): Promise<BoardDTO> => {
        const res = await fetch(`${API_BASE_URL}/boards`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка создания доски');
        }

        const json = await res.json();
        return json.data || json;
    }
};

export const tasksApi = {
    getByBoard: async (boardId: number, token: string): Promise<TaskDTO[]> => {
        const res = await fetch(`${API_BASE_URL}/tasks?board_id=${boardId}`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки задач');
        }

        const json = await res.json();
        return json.data || [];
    },

    getById: async (taskId: number, token: string): Promise<TaskDTO> => {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки задачи');
        }

        const json = await res.json();
        return json.data || json;
    },

    create: async (data: CreateTaskRequest, token: string): Promise<TaskDTO> => {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка создания задачи');
        }

        const json = await res.json();
        return json.data || json;
    },

update: async (taskId: number, data: Partial<CreateTaskRequest>, token: string): Promise<TaskDTO> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify(data), 
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Ошибка обновления задачи');
    }

    const json = await res.json();
    return json.data || json;
},

    delete: async (taskId: number, token: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка удаления задачи');
        }
    }
};

export const commentsApi = {
    getByTask: async (taskId: number, token: string): Promise<CommentDTO[]> => {
        const res = await fetch(`${API_BASE_URL}/comments?task_id=${taskId}`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки комментариев');
        }

        const json = await res.json();
        return json.data || [];
    },

    create: async (data: CreateCommentRequest, token: string): Promise<CommentDTO> => {
        const res = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка создания комментария');
        }

        const json = await res.json();
        return json.data || json;
    },

    update: async (commentId: number, data: { content: string }, token: string): Promise<CommentDTO> => {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка обновления комментария');
        }

        const json = await res.json();
        return json.data || json;
    },

    delete: async (commentId: number, token: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка удаления комментария');
        }
    }
};

export const subtasksApi = {
    getByTask: async (taskId: number, token: string): Promise<SubtaskDTO[]> => {
        const res = await fetch(`${API_BASE_URL}/subtasks?task_id=${taskId}`, {
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка загрузки подзадач');
        }

        const json = await res.json();
        return json.data || [];
    },

    create: async (data: CreateSubtaskRequest, token: string): Promise<SubtaskDTO> => {
        const res = await fetch(`${API_BASE_URL}/subtasks`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка создания подзадачи');
        }

        const json = await res.json();
        return json.data || json;
    },

    update: async (subtaskId: number, data: Partial<CreateSubtaskRequest>, token: string): Promise<SubtaskDTO> => {
        const res = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка обновления подзадачи');
        }

        const json = await res.json();
        return json.data || json;
    },

    delete: async (subtaskId: number, token: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/subtasks/${subtaskId}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка удаления подзадачи');
        }
    }
};