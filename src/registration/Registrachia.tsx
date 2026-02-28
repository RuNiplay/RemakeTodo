import { useState } from "react";
import "./Registrachia.css";

const Registrachia = () => {
    const [form, setForm] = useState({
        login: "",
        email: "",
        password: ""
    });

    const handleGuestLogin = () => {
        window.location.href = "/boards";
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        console.log("Регистрация:", form);
    };

    return (
        <div className="container">
            <div className="left">
                <div className="form-container">
                    <h2>Регистрация</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Логин"
                                value={form.login}
                                onChange={(e) => setForm({...form, login: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                            />
                        </div>
                        
                        <button type="submit" className="register-btn">
                            Зарегистрироваться
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