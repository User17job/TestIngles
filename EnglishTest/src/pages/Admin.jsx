import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Trash, ArrowLeft } from "lucide-react";
import { api } from "../services/api";

const Admin = ({ onBack }) => {
  const [tab, setTab] = useState("list");
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    loadQuestions();
    loadResults();
  }, []);

  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 3000);
  };

  const loadResults = async () => {
    try {
      const data = await api.getResults();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("Error al cargar resultados");
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await api.getQuestions();
      const questionsArray = data?.questions?.questions[0]?.questions || [];
      console.log(questionsArray);
      setQuestions(questionsArray);
    } catch (error) {
      console.error("Error al cargar preguntas:", error);
      showAlert("Error al cargar preguntas");
    }
  };

  const getDefaultOptions = (type) => {
    switch (type) {
      case "multiple":
        return ["", "", ""];
      case "fillInBlanks":
      case "arrange":
      case "translate":
      case "boolean":
        return [];
      default:
        return [];
    }
  };

  const getDefaultQuestion = (type) => ({
    id: Date.now().toString(),
    type,
    question: "",
    options: getDefaultOptions(type),
    correct: type === "boolean" ? "true" : "",
  });

  const addQuestion = () => {
    setQuestions([...questions, getDefaultQuestion("multiple")]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    const question = { ...newQuestions[index] };

    if (field === "type") {
      const defaultQuestion = getDefaultQuestion(value);
      question.type = value;
      question.options = defaultQuestion.options;
      question.correct = defaultQuestion.correct;
    } else {
      question[field] = value;
    }

    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const removeQuestion = async (index) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta pregunta?")
    ) {
      return;
    }

    const questionToRemove = questions[index];
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);

    try {
      if (questionToRemove.id) {
        await api.deleteQuestion(questionToRemove.id);
        showAlert("Pregunta eliminada correctamente", "success");
      }
    } catch (error) {
      setQuestions([...questions]);
      showAlert("Error al eliminar la pregunta");
    }
  };

  const validateQuestions = () => {
    return questions.every((q) => {
      if (!q.question?.trim()) return false;

      switch (q.type) {
        case "multiple":
          return (
            q.options.every((opt) => opt?.trim()) &&
            typeof q.correct === "string" &&
            q.correct.trim()
          );
        case "fillInBlanks":
          return (
            typeof q.correct === "string" &&
            q.correct.trim() &&
            q.question.includes("___")
          );
        case "arrange":
          return (
            q.options.length > 0 &&
            typeof q.correct === "string" &&
            q.correct.trim()
          );
        case "translate":
        case "boolean":
          return typeof q.correct === "string" && q.correct.trim();
        default:
          return false;
      }
    });
  };

  const saveQuestions = async () => {
    if (!validateQuestions()) {
      showAlert("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      const formattedQuestions = {
        questions: [
          {
            id: "2816",
            questions: questions.map((q) => ({
              ...q,
              correct:
                q.type === "boolean" ? String(q.correct) === "true" : q.correct,
              points: q.points || 5,
            })),
          },
        ],
      };

      await api.updateQuestions(formattedQuestions);
      await loadQuestions();
      showAlert("Cambios guardados exitosamente", "success");
    } catch (error) {
      console.error("Error saving questions:", error);
      showAlert("Error al guardar los cambios: " + error.message);
    }
  };

  const renderQuestionFields = (q, index) => {
    const inputBaseClass =
      "w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow";
    const textAreaClass = `${inputBaseClass} resize-none`;
    const selectClass = `${inputBaseClass} bg-white`;

    switch (q.type) {
      case "fillInBlanks":
        return (
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <textarea
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className={`${textAreaClass}`}
              placeholder="Texto con ___ para espacios en blanco"
              rows={3}
            />
            <input
              type="text"
              value={q.correct}
              onChange={(e) => updateQuestion(index, "correct", e.target.value)}
              className={inputBaseClass}
              placeholder="Respuestas separadas por coma (ej: is,are,were)"
            />
          </div>
        );
      case "arrange":
        return (
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <input
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className={inputBaseClass}
              placeholder="Instrucción para ordenar palabras"
            />
            <input
              type="text"
              value={q.options.join(",")}
              onChange={(e) => {
                const words = e.target.value.split(",").map((w) => w.trim());
                updateQuestion(index, "options", words);
              }}
              className={inputBaseClass}
              placeholder="Palabras separadas por coma"
            />
            <input
              type="text"
              value={q.correct}
              onChange={(e) => updateQuestion(index, "correct", e.target.value)}
              className={inputBaseClass}
              placeholder="Orden correcto (frase completa)"
            />
          </div>
        );
      default:
        return (
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <input
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className={`${inputBaseClass}`}
              placeholder="Pregunta"
            />
            {q.type === "multiple" && (
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <input
                    key={`${q.id || index}-option-${optIndex}`}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...q.options];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(index, "options", newOptions);
                    }}
                    className={inputBaseClass}
                    placeholder={`Opción ${optIndex + 1}`}
                  />
                ))}
                <input
                  type="text"
                  value={q.correct}
                  onChange={(e) =>
                    updateQuestion(index, "correct", e.target.value)
                  }
                  className={inputBaseClass}
                  placeholder="Respuesta correcta"
                />
              </div>
            )}
            {q.type === "boolean" && (
              <select
                value={q.correct}
                onChange={(e) =>
                  updateQuestion(index, "correct", e.target.value)
                }
                className={selectClass}
              >
                <option value="true">Verdadero</option>
                <option value="false">Falso</option>
              </select>
            )}
            {q.type === "translate" && (
              <input
                type="text"
                value={q.correct}
                onChange={(e) =>
                  updateQuestion(index, "correct", e.target.value)
                }
                className={inputBaseClass}
                placeholder="Traducción correcta"
              />
            )}
          </div>
        );
    }
  };

  const QuestionsList = () => {
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

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lista de Preguntas</h2>
          <button
            onClick={() => {
              setEditMode(true);
              setTab("questions");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Editar Preguntas
          </button>
        </div>

        {questions.map((question) => (
          <div
            key={question.id || `list-question-${question.question}`}
            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg relative group hover:scale-105 transition-transform duration-300"
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
                onClick={() =>
                  removeQuestion(
                    questions.findIndex((q) => q.id === question.id)
                  )
                }
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                title="Eliminar pregunta"
              >
                <Trash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDeleteResult = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este resultado?")
    ) {
      try {
        await api.deleteResult(id);
        setResults((prevResults) =>
          prevResults.filter((result) => result.id !== id)
        );
        showAlert("Resultado eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar el resultado:", error);
        showAlert("Error al eliminar el resultado");
      }
    }
  };
  // tab === "questions"
  const renderResults = () => (
    <div className="space-y-4">
      {results && results.length > 0 ? (
        results.map((result, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg relative group hover:scale-105 transition-transform duration-300"
          >
            <div className="absolute top-2 right-2 hidden group-hover:block">
              <button
                onClick={() => handleDeleteResult(result.id)}
                className="p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash size={18} />
              </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-blue-900 text-lg">
                {result?.studentName || "Estudiante sin nombre"}
              </h3>
              <span className="text-xl font-bold text-blue-600">
                {typeof result?.score === "number"
                  ? `${result.score.toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="text-sm text-gray-600 italic">
              Fecha:{" "}
              {result?.date
                ? new Date(result.date).toLocaleString()
                : "Fecha no disponible"}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-4 text-gray-500">
          No hay resultados disponibles
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-600"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      {alertMessage && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            alertType === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {alertMessage}
        </div>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">
            Panel de Administración
          </CardTitle>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setTab("list");
                setEditMode(false);
              }}
              className={`p-2 ${
                tab === "list" ? "border-b-2 border-blue-500" : ""
              }`}
            >
              Lista de Preguntas
            </button>
            {editMode && (
              <button
                onClick={() => setTab("questions")}
                className={`p-2 ${
                  tab === "questions" ? "border-b-2 border-blue-500" : ""
                }`}
              >
                Editor
              </button>
            )}
            <button
              onClick={() => setTab("results")}
              className={`p-2 ${
                tab === "results" ? "border-b-2 border-blue-500" : ""
              }`}
            >
              Resultados
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {tab === "list" && <QuestionsList />}
          {tab === "questions" && (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={q.id || `question-${index}`}
                  className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg relative group hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex justify-between mb-4">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(index, "type", e.target.value)
                      }
                      className="p-2 border rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow"
                    >
                      <option value="multiple">Opción Múltiple</option>
                      <option value="translate">Traducción</option>
                      <option value="boolean">Verdadero/Falso</option>
                      <option value="fillInBlanks">Completar Espacios</option>
                      <option value="arrange">Ordenar Palabras</option>
                    </select>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                    >
                      <Trash size={20} />
                    </button>
                  </div>

                  {renderQuestionFields(q, index)}
                </div>
              ))}

              <div className="flex gap-4">
                <button
                  onClick={addQuestion}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Agregar Pregunta
                </button>
                <button
                  onClick={saveQuestions}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
          {tab === "results" && renderResults()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
