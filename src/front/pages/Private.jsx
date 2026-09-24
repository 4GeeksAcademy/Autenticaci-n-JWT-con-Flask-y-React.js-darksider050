import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const Private = () => {
    const [status, setStatus] = useState("checking");
    const [user, setUser] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            setStatus("unauthorized");
            return;
        }
        fetch(`${backendUrl}/api/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg);
                setUser(data.user);
                setStatus("authorized");
            })
            .catch(() => {
                sessionStorage.removeItem("token");
                setStatus("unauthorized");
            });
    }, [backendUrl]);

    if (status === "unauthorized") return <Navigate to="/login" replace />;
    if (status === "checking") return <main className="container py-5"><p>Validando sesión...</p></main>;

    return <main className="container py-5"><h1>Área privada</h1><p>Bienvenido, {user.email}.</p></main>;
};