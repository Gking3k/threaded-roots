import { useEffect, useState } from "react";

import { getHealth } from "./services/api";

function App() {
  const [status, setStatus] =
    useState("Checking backend...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const data =
          await getHealth();

        setStatus(data.message || "Backend connected.");
      } catch (error) {
        console.error(error);

        setStatus(
          "Unable to connect to backend."
        );
      }
    }

    checkBackend();
  }, []);

  return (
    <main>
      <h1>Threaded Roots</h1>

      <p>
        Traditional textiles.
        Modern expression.
      </p>

      <p>
        Backend status: {status}
      </p>
    </main>
  );
}

export default App;