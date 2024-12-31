import React from "react";
import { Book, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Welcome = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-white/90 backdrop-blur">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
              Plataforma de Tests de Inglés
            </h1>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Bienvenido a nuestra plataforma complementaria de tests de la
              Tutoria en el ingles. Elige tu rol para continuar.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <button
                onClick={() => onNavigate("test")}
                className="group relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex flex-col items-center gap-4">
                  <Book
                    size={48}
                    className="text-blue-600 group-hover:scale-110 transition-transform"
                  />
                  <h2 className="text-2xl font-semibold text-blue-800">
                    Estudiante
                  </h2>
                  <p className="text-blue-600">Realizar test de inglés</p>
                </div>
              </button>

              <button
                onClick={() => onNavigate("admin")}
                className="group relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex flex-col items-center gap-4">
                  <Settings
                    size={48}
                    className="text-purple-600 group-hover:scale-110 transition-transform"
                  />
                  <h2 className="text-2xl font-semibold text-purple-800">
                    Profesor
                  </h2>
                  <p className="text-purple-600">Administrar preguntas</p>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
