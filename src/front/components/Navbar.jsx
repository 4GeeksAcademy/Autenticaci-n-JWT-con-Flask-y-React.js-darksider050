import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();
	const isAuthenticated = Boolean(sessionStorage.getItem("token"));

	const logout = () => {
		sessionStorage.removeItem("token");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto">
					{isAuthenticated ? (
						<button className="btn btn-outline-danger" onClick={logout}>Cerrar sesión</button>
					) : (
						<>
							<Link className="btn btn-outline-primary mr-2" to="/login">Iniciar sesión</Link>
							<Link className="btn btn-primary" to="/signup">Registrarse</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};