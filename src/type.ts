export interface Project {
    id: number;
    name: string;
    folders: string[];
}

export interface RegisterInput {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    username: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface FolderDTO {
    id: number;
    name: string;
}

export interface GetAllFoldersResponse {
    folders: FolderDTO[] | null;
}

export interface GetFolderResponse {
    id: number;
    name: string;
}

export interface CreateFolderRequest {
    id?: number;
    name: string;
}

export interface CreateFolderResponse {
    id: number;
    name: string;
}

export interface UpdateFolderRequest {
    name: string;
}

export interface UpdateFolderResponse {
    id: number;
    name: string;
}

export interface BoardDTO {
    id: number;
    name: string;
    folder_id: number | null;
}

export interface GetAllBoardsResponse {
    boards: BoardDTO[];
}

export interface GetBoardResponse {
    folder_id: number | null;
    items?: { id: number; name: string }[];
}

export interface CreateBoardRequest {
    name: string;
    folder_id: number | null;
    id?: number;
}

export interface CreateBoardResponse {
    id: number;
    body: {
        folder_id: number | null;
        id: number;
        name: string;
    };
}

export interface UpdateBoardRequest {
    folder_id?: number | null;
    name?: string | null;
}

export interface GetBoardsByFolderResponse {
    boards: BoardDTO[];
}

export interface TaskDTO {
    id: number;
    description: string;
    name: string;
    priority: 'easy' | 'medium' | 'hard';
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    dueDate?: string | null;
    comments?: CommentDTO[];
    subtasks?: SubtaskDTO[];
}

export interface GetAllTasksResponse {
    tasks: TaskDTO[] | null;
}

export interface GetTaskResponse {
    description: string;
    name: string;
    priority: 'easy' | 'medium' | 'hard';
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    comments?: CommentDTO[];
    subtasks?: SubtaskDTO[];
}

export interface CreateTaskRequest {
    description: string;
    name: string;
    priority: 'easy' | 'medium' | 'hard';
    status: 'backlog' | 'in_progress' | 'review' | 'done';
    board_id: number;
    dueDate?: string | null;
}

export interface UpdateTaskRequest {
    description?: string;
    name?: string;
    priority?: 'easy' | 'medium' | 'hard';
    status?: 'backlog' | 'in_progress' | 'review' | 'done';
    dueDate?: string | null;
}

export interface CommentDTO {
    id: number;
    Message: string;        
    author_id: number;
    TaskID: number;        
    created_at?: string;
}

export interface CreateCommentRequest {
    message: string;
    task_id: number;
}

export interface UpdateCommentRequest {
    message: string;
}

export interface SubtaskDTO {
    id: number;
    name: string;
    completed: boolean;
    task_id: number;
}

export interface CreateSubtaskRequest {
    name: string;
    task_id: number;
}

export interface UpdateSubtaskRequest {
    name?: string;
    completed?: boolean;
}

export interface FolderListProps {
    folders: FolderDTO[];
    setFolders: (folders: FolderDTO[]) => void;
    token: string;
    expandedFolderId: number | null;
    boardsByFolder: Record<number, BoardDTO[]>;
    loadingBoards: Record<number, boolean>;
    onFolderClick: (folderId: number) => void;
    onCreateBoard: (folderId: number, name: string) => void;
    onBoardClick: (boardId: number, boardName: string, folderName: string) => void;
    selectedBoardId: number | null;
}

export interface BoardsProps {
    boards: BoardDTO[];
    selectedBoardId?: number | null;
    onBoardClick?: (boardId: number) => void;
    onCreateBoard?: (name: string) => void;
}

export interface TasksProps {
    tasks: TaskDTO[];
    loading?: boolean;
    boardId: number;
    onCreateTask: (
        boardId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null,
        description?: string | null
    ) => void;
    onUpdateTask: (
        taskId: number,
        name: string,
        status: 'backlog' | 'in_progress' | 'review' | 'done',
        priority: 'easy' | 'medium' | 'hard',
        dueDate?: string | null,
        description?: string | null
    ) => void;
    onDeleteTask: (taskId: number) => void;
}

export interface ApiError {
    message?: string;
    status?: number;
}

export interface UserProfile {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}