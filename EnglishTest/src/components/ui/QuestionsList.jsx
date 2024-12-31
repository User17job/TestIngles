import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, ArrowLeft } from "lucide-react";
import { api } from "../services/api";

const AdminQuestionsList = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions();
      // Aplanar la estructura de preguntas
      const flatQuestions = data.questions.reduce((acc, item) => {
        if (item.questions && Array.isArray(item.questions)) {
          return [...acc, ...item.questions];
        }
        return [...acc, item];
      }, []);
      setQuestions(flatQuestions);
    } catch (err) {
      setError("Error al cargar las preguntas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta pregunta?")
    ) {
      return;
    }

    try {
      await api.deleteQuestion(questionId);
      await loadQuestions();
    } catch (err) {
      setError("Error al eliminar la pregunta");
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      multiple: "Opción Múltiple",
      translate: "Traducción",
      boolean: "Verdadero/Falso",
      fillInBlanks: "Completar Espacios",
      arrange: "Ordenar Palabras",
    };
    return types[type] || type;
  };

  const renderQuestionContent = (question) => {
    switch (question.type) {
      case "multiple":
        return (
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Opciones:</p>
            <ul className="list-disc pl-5">
              {question.options.map((opt, idx) => (
                <li
                  key={idx}
                  className={
                    opt === question.correct
                      ? "font-semibold text-green-600"
                      : ""
                  }
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        );
      case "boolean":
        return (
          <p className="mt-2 text-sm text-gray-600">
            Respuesta:{" "}
            <span className="font-semibold">
              {question.correct ? "Verdadero" : "Falso"}
            </span>
          </p>
        );
      case "translate":
      case "fillInBlanks":
        return (
          <p className="mt-2 text-sm text-gray-600">
            Respuesta correcta:{" "}
            <span className="font-semibold">{question.correct}</span>
          </p>
        );
      case "arrange":
        return (
          <div className="mt-2 text-sm text-gray-600">
            <p>Palabras:</p>
            <p className="font-semibold">{question.options.join(" - ")}</p>
            <p className="mt-1">Orden correcto:</p>
            <p className="font-semibold">{question.correct}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Cargando preguntas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">
            Lista de Preguntas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      {question.points && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {question.points} puntos
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {question.question}
                    </h3>
                    {renderQuestionContent(question)}
                  </div>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar pregunta"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay preguntas disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuestionsList;
