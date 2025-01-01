const API_URL = "http://localhost:3001";

export const api = {
  getQuestions: () => fetch(`${API_URL}/questions`).then((res) => res.json()),

  getQuestion: async (id) => {
    const response = await fetch(`${API_URL}/questions/${id}`);
    if (!response.ok) throw new Error("Failed to fetch question");

    return response.json();
  },

  updateQuestions: (questions) =>
    fetch(`${API_URL}/questions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error al actualizar las preguntas: ${response.status}`
        );
      }
      return response.json();
    }),

  deleteQuestion: (questionId) =>
    fetch(`${API_URL}/questions/${questionId}`, {
      method: "DELETE",
    }),

  saveResult: (result) =>
    fetch(`${API_URL}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    }),

  getResults: () => fetch(`${API_URL}/results`).then((res) => res.json()),
};
