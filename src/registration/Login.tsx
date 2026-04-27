import { useState } from "react";
import "./Registrachia.css";

const Login = () => {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        
        try {
            const response = await fetch('http://185.207.64.215:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password
                })
            });

            const data = await response.json();
            console.log('Ответ логина:', data);

            if (response.ok) {
                // Ищем токен
                const token = data.AccessToken || data.accessToken || data.token || data.access_token;
                
                if (token) {
                    localStorage.setItem('token', token);
                    setMessage("Вход выполнен!");
                    setTimeout(() => {
                        window.location.href = "/boards";
                    }, 1000);
                } else {
                    setMessage(" Токен не найден в ответе");
                }
            } else {
                setMessage(` Ошибка: ${data.message || 'Неверный логин/пароль'}`);
            }
        } catch (error) {
            setMessage(" Сервер не отвечает. Запущен ли Docker?");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="left">
                <div className="form-container">
                    <h2>Вход</h2>
                    
                    {message && (
                        <div style={{ 
                            padding: '10px', 
                            marginBottom: '15px',
                            background: message.includes('') ? '#e6ffe6' : '#ffe6e6',
                            borderRadius: '8px'
                        }}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Логин"
                                value={form.username}
                                onChange={(e) => setForm({...form, username: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="register-btn"
                            disabled={loading}
                        >
                            {loading ? "Вход..." : "Войти"}
                        </button>
                    </form>
                    
                    <button 
                        onClick={() => window.location.href = "/"} 
                        className="guest-btn"
                    >
                        Нет аккаунта? Зарегистрироваться
                    </button>
                </div>
            </div>
            
            <div className="right">
                <img src="/logo.svg" alt="Yotabo" className="right-image" />
            </div>
        </div>
    );
};

export default Login;