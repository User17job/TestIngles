import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = ({ onLogin, onBack }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      credentials.username === "Ramphys" &&
      credentials.password === "believe%"
    ) {
      onLogin();
    } else {
      setError("Credenciales inválidas");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Usuario"
                className="w-full p-2 border rounded"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-2 border rounded"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 p-2 border rounded hover:bg-gray-100"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Entrar
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
