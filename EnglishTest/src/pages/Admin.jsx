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
      let questionsArray = [];

      // Procesar preguntas directas (sin anidación)
      const directQuestions = data.filter((item) => !item.questions);

      // Procesar preguntas anidadas
      const nestedQuestions = data
        .filter((item) => item.questions)
        .flatMap((item) =>
          item.questions.flatMap((subItem) => subItem.questions || [])
        );

      questionsArray = [...directQuestions, ...nestedQuestions];
      setQuestions(questionsArray);
    } catch (error) {
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
      if (!q.question.trim()) return false;

      switch (q.type) {
        case "multiple":
          return q.options.every((opt) => opt.trim()) && q.correct.trim();
        case "fillInBlanks":
          return q.correct.trim() && q.question.includes("___");
        case "arrange":
          return q.options.length > 0 && q.correct.trim();
        case "translate":
        case "boolean":
          return q.correct.trim();
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
      const formattedQuestions = questions.map((q) => ({
        ...q,
        correct: q.type === "boolean" ? q.correct === "true" : q.correct,
      }));

      await api.updateQuestions([
        { id: "2816", questions: formattedQuestions },
      ]);
      await loadQuestions();
      showAlert("Cambios guardados exitosamente", "success");
    } catch (error) {
      showAlert("Error al guardar los cambios");
    }
  };

  const renderQuestionFields = (q, index) => {
    switch (q.type) {
      case "fillInBlanks":
        return (
          <div className="space-y-2">
            <textarea
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="Texto con ___ para espacios en blanco"
              rows={3}
            />
            <input
              type="text"
              value={q.correct}
              onChange={(e) => updateQuestion(index, "correct", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Respuestas separadas por coma (ej: is,are,were)"
            />
          </div>
        );
      case "arrange":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className="w-full p-2 border rounded"
              placeholder="Instrucción para ordenar palabras"
            />
            <input
              type="text"
              value={q.options.join(",")}
              onChange={(e) => {
                const words = e.target.value.split(",").map((w) => w.trim());
                updateQuestion(index, "options", words);
              }}
              className="w-full p-2 border rounded"
              placeholder="Palabras separadas por coma"
            />
            <input
              type="text"
              value={q.correct}
              onChange={(e) => updateQuestion(index, "correct", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Orden correcto (frase completa)"
            />
          </div>
        );
      default:
        return (
          <>
            <input
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className="w-full p-2 border rounded mb-4"
              placeholder="Pregunta"
            />
            {q.type === "multiple" && (
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...q.options];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(index, "options", newOptions);
                    }}
                    className="w-full p-2 border rounded"
                    placeholder={`Opción ${optIndex + 1}`}
                  />
                ))}
                <input
                  type="text"
                  value={q.correct}
                  onChange={(e) =>
                    updateQuestion(index, "correct", e.target.value)
                  }
                  className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
                placeholder="Traducción correcta"
              />
            )}
          </>
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Editar Preguntas
          </button>
        </div>

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
                onClick={() =>
                  removeQuestion(
                    questions.findIndex((q) => q.id === question.id)
                  )
                }
                className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
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

  const renderResults = () => (
    <div className="space-y-4">
      {results && results.length > 0 ? (
        results.map((result, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">
                {result?.studentName || "Estudiante sin nombre"}
              </h3>
              <span className="text-lg">
                {typeof result?.score === "number"
                  ? `${result.score.toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="text-sm text-gray-600">
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
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
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
                <div key={q.id} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex justify-between mb-4">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(index, "type", e.target.value)
                      }
                      className="p-2 border rounded"
                    >
                      <option value="multiple">Opción Múltiple</option>
                      <option value="translate">Traducción</option>
                      <option value="boolean">Verdadero/Falso</option>
                      <option value="fillInBlanks">Completar Espacios</option>
                      <option value="arrange">Ordenar Palabras</option>
                    </select>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700"
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
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Agregar Pregunta
                </button>
                <button
                  onClick={saveQuestions}
                  className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
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
