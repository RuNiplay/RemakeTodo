import { useState } from "react";
import "./Boards.css"
import type { Project } from "./type"


function Boards() {
    const [project, setProject] = useState<Project[]>([])
    const [showInput, setShowInput] = useState(false)
    const [newName, setNewName] = useState<string>("")

    function addProject() {
        if (newName.trim() === "") return;
        const newProject = {
            id: Date.now(),
            name: newName,
            folders: []
        }
        setProject([...project, newProject])
        setNewName('');
        setShowInput(false);
    }

    return (
        <>
        <h3>Проекты</h3>
        <span>Название </span>
        <span>Дата</span>
        <button onClick = {()  => setShowInput(true)}>
            Добавить проект
        </button>
        {showInput && (
            <div>
                <input 
                 value={newName}
                 onChange={(e) => setNewName(e.target.value)}
                 placeholder="Название"
                 />
                 <button onClick={addProject}>Создать</button>
            </div>
        )}
        <div>
            {project.map(p => (
                <div key = {p.id}>📁 {p.name}</div>
            ))}
        </div>
        </>
    );
}

export default Boards;