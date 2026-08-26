import API_URL from "../config/apiConfig";

export async function getHealth() {
  const response = await fetch(
    `${API_URL.replace(/\/api$/, "")}/health`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to connect to the backend"
    );
  }

  return data;
}