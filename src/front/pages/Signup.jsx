import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const response = await fetch(`${backendUrl}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || "No se pudo registrar el usuario");
            navigate("/login");
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <form className="col-md-6 col-lg-4" onSubmit={handleSubmit}>
                    <h1 className="mb-4">Crear cuenta</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <label className="form-label" htmlFor="signup-email">Correo</label>
                    <input id="signup-email" className="form-control mb-3" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    <label className="form-label" htmlFor="signup-password">Contraseña</label>
                    <input id="signup-password" className="form-control mb-3" type="password" minLength="6" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                    <button className="btn btn-primary w-100" type="submit">Registrarse</button>
                    <p className="mt-3">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
                </form>
            </div>
        </main>
    );
};