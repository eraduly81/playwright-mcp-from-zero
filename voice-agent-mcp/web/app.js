const sessionOutput = document.querySelector("#session-output");
const mcpOutput = document.querySelector("#mcp-output");

const modelInput = document.querySelector("#model");
const voiceInput = document.querySelector("#voice");
const instructionsInput = document.querySelector("#instructions");
const mcpUrlInput = document.querySelector("#mcp-url");

const createSessionButton = document.querySelector("#create-session");
const listToolsButton = document.querySelector("#list-tools");
const listResourcesButton = document.querySelector("#list-resources");

function prettyPrint(target, payload) {
  target.textContent = JSON.stringify(payload, null, 2);
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || "Request failed");
  }
  return text ? JSON.parse(text) : {};
}

createSessionButton.addEventListener("click", async () => {
  sessionOutput.textContent = "Creating session...";
  try {
    const payload = {
      model: modelInput.value.trim() || "gpt-realtime",
      instructions: instructionsInput.value.trim(),
    };
    if (voiceInput.value.trim()) {
      payload.voice = voiceInput.value.trim();
    }
    const data = await postJson("/api/realtime/session", payload);
    prettyPrint(sessionOutput, data);
  } catch (error) {
    sessionOutput.textContent = String(error);
  }
});

listToolsButton.addEventListener("click", async () => {
  mcpOutput.textContent = "Loading tools...";
  try {
    const payload = {
      serverUrl: mcpUrlInput.value.trim() || undefined,
    };
    const data = await postJson("/api/mcp/tools-list", payload);
    prettyPrint(mcpOutput, data);
  } catch (error) {
    mcpOutput.textContent = String(error);
  }
});

listResourcesButton.addEventListener("click", async () => {
  mcpOutput.textContent = "Loading resources...";
  try {
    const payload = {
      serverUrl: mcpUrlInput.value.trim() || undefined,
    };
    const data = await postJson("/api/mcp/resources-list", payload);
    prettyPrint(mcpOutput, data);
  } catch (error) {
    mcpOutput.textContent = String(error);
  }
});
