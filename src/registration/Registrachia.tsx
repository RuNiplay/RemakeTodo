import { useState } from "react";
import "./Registrachia.css";

const Registrachia = () => {
    const [form, setForm] = useState({
        login: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGuestLogin = () => {
        window.location.href = "/boards";
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        
        try {
            const response = await fetch('http://185.207.64.215:8080/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    firstname: form.firstname,
                    lastname: form.lastname,
                    password: form.password,
                    username: form.login
                })
            });

            const data = await response.json();
            console.log('Ответ сервера:', data);

            if (response.ok) {
                const token = data.AccessToken || data.accessToken || data.token || data.access_token;
                
                if (token) {
                    localStorage.setItem('token', token);
                    console.log(' Токен сохранён:', token);
                } else {
                    console.warn(' Токен не найден в ответе:', data);
                }
                
                setMessage(" Регистрация успешна!");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
            } else {
                setMessage(` Ошибка: ${JSON.stringify(data)}`);
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
                    <h2>Регистрация</h2>
                    
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
                                placeholder="Имя"
                                value={form.firstname}
                                onChange={(e) => setForm({...form, firstname: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Фамилия"
                                value={form.lastname}
                                onChange={(e) => setForm({...form, lastname: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Логин (макс. 12 символов)"
                                maxLength={12}
                                value={form.login}
                                onChange={(e) => setForm({...form, login: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Пароль (макс. 12 символов)"
                                maxLength={12}
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
                            {loading ? "Отправка..." : "Зарегистрироваться"}
                        </button>
                    </form>
                    
                    <button onClick={handleGuestLogin} className="guest-btn">
                        Пропустить регистрацию
                    </button>
                </div>
            </div>
            
            <div className="right">
                <img src="/logo.svg" alt="Yotabo" className="right-image" />
            </div>
        </div>
    );
};

export default Registrachia;