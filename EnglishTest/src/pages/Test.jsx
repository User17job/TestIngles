import React, { useState, useEffect } from "react";
import { Send, Eye, Award, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../services/api";

const TestApp = ({ onBack }) => {
  const [studentName, setStudentName] = useState("");
  const [currentStep, setCurrentStep] = useState("welcome");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showMistakes, setShowMistakes] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/questions/")
      .then((res) => res.json())
      .then((data) => {
        // Extract questions from the nested structure
        const questionsArray = data?.questions?.questions[0]?.questions || [];
        console.log("Extracted questions:", questionsArray);
        setQuestions(questionsArray);
      })
      .catch((error) => {
        console.error("Error al obtener preguntas:", error);
      });
  }, []);

  const calculateScore = () => {
    let totalScore = 0;
    let totalPossibleScore = questions.reduce(
      (sum, q) => sum + (q.points || 0),
      0
    );

    questions.forEach((q) => {
      const userAnswer = answers[q.id || q.question]; // Fallback to question text if no ID
      if (!userAnswer) return;

      switch (q.type) {
        case "fillInBlanks":
          const userAnswers = userAnswer
            .split(",")
            .map((a) => a.trim().toLowerCase());
          const correctAnswers = q.correct
            .split(",")
            .map((a) => a.trim().toLowerCase());
          const correctCount = userAnswers.filter(
            (a, i) => a === correctAnswers[i]
          ).length;
          totalScore +=
            (correctCount / correctAnswers.length) * (q.points || 0);
          break;

        case "arrange":
          if (
            userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()
          ) {
            totalScore += q.points || 0;
          }
          break;

        case "boolean":
          const boolAnswer = userAnswer === "true";
          if (boolAnswer === (q.correct === "true")) {
            totalScore += q.points || 0;
          }
          break;

        default:
          if (
            userAnswer.toLowerCase().trim() ===
            String(q.correct).toLowerCase().trim()
          ) {
            totalScore += q.points || 0;
          }
      }
    });

    return totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
  };

  // In handleSubmit:
  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);

    try {
      await api.saveResult({
        studentName,
        score: finalScore,
        answers,
        date: new Date(),
      });
      setCurrentStep("results");
    } catch (error) {
      console.error("Error saving results:", error);
      alert("Error al guardar los resultados");
    }
  };
  const renderQuestion = (q) => {
    const questionId = q.id || q.question; // Use question text as fallback ID

    switch (q.type) {
      case "fillInBlanks":
        const parts = q.question.split("___");
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {parts.map((part, i) => (
                <React.Fragment key={i}>
                  <span>{part}</span>
                  {i < parts.length - 1 && (
                    <input
                      type="text"
                      className="border-b-2 border-blue-500 w-24 text-center px-2 py-1"
                      value={(answers[questionId] || "").split(",")[i] || ""}
                      onChange={(e) => {
                        const currentAnswers = (
                          answers[questionId] || ""
                        ).split(",");
                        currentAnswers[i] = e.target.value;
                        setAnswers({
                          ...answers,
                          [questionId]: currentAnswers.join(","),
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      // ... rest of the cases remain the same but update [q.id] to [questionId]
      case "arrange":
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {(q.options || []).map((word, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const currentAnswer = answers[questionId] || "";
                    const newAnswer = currentAnswer
                      ? `${currentAnswer} ${word}`
                      : word;
                    setAnswers({ ...answers, [questionId]: newAnswer });
                  }}
                  className="px-3 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={answers[questionId] || ""}
                readOnly
                className="w-full p-2 border rounded bg-gray-50"
                placeholder="Tu frase ordenada..."
              />
              <button
                onClick={() => setAnswers({ ...answers, [questionId]: "" })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Limpiar respuesta
              </button>
            </div>
          </div>
        );
      case "multiple":
        return (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                className={`w-full p-2 rounded ${
                  answers[q.id] === opt
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 hover:bg-blue-200"
                } transition-colors duration-300`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "translate":
        return (
          <input
            type="text"
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu respuesta..."
          />
        );

      case "boolean":
        return (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAnswers({ ...answers, [q.id]: "true" })}
              className={`p-2 px-4 rounded ${
                answers[q.id] === "true"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-200"
              } transition-colors duration-300`}
            >
              Verdadero
            </button>
            <button
              onClick={() => setAnswers({ ...answers, [q.id]: "false" })}
              className={`p-2 px-4 rounded ${
                answers[q.id] === "false"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 hover:bg-blue-200"
              } transition-colors duration-300`}
            >
              Falso
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">
            Test de Inglés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === "welcome" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => setCurrentStep("test")}
                disabled={!studentName}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50"
              >
                Comenzar Test
              </button>
            </div>
          )}

          {currentStep === "test" && (
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-4 bg-white rounded-lg shadow animate-fadeIn"
                >
                  <h3 className="font-bold mb-2">
                    {i + 1}. {q.question} ({q.points} puntos)
                  </h3>
                  {renderQuestion(q)}
                </div>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                disabled={Object.keys(answers).length !== questions.length}
              >
                <Send size={20} />
                Enviar Respuestas
              </button>
            </div>
          )}

          {currentStep === "results" && (
            <div className="text-center space-y-4 animate-fadeIn">
              <Award size={64} className="mx-auto text-blue-500" />
              <h2 className="text-2xl font-bold">
                Puntuación: {Math.round(score)} / 100
              </h2>
              <button
                onClick={() => setShowMistakes(!showMistakes)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 mx-auto"
              >
                <Eye size={20} />
                {showMistakes ? "Ocultar" : "Ver"} Errores
              </button>

              {showMistakes && (
                <div className="space-y-4 text-left">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 rounded ${
                        String(answers[q.id]) === String(q.correct)
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <p className="font-bold">{q.question}</p>
                      <p>Tu respuesta: {answers[q.id]?.toString()}</p>
                      <p>Respuesta correcta: {q.correct.toString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestApp;
