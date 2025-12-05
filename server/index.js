import {getLlama, LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";
import express from "express";

const app = express();
app.use(express.json());

// Загружаем модель GGUF
const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: "models/Qwen3-1.7B-Q8_0.gguf"
});

function removeWords(str, fragments) {
    const escaped = fragments.map(f =>
        f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(escaped.join("|"), "g");
    return str.replace(regex, "");
}


// HTTP API, к которому будет обращаться ваше расширение
app.post("/api/llm", async (req, res) => {
    const context = await model.createContext();
    const session = new LlamaChatSession({
    contextSequence: context.getSequence()
    });
    const prompt = req.body.prompt ?? "";

    try {
        var answer = await session.prompt(prompt);
        answer = removeWords(answer,["</think>"]);
        res.send( answer );
        console.log(prompt,answer);
    } catch (err) {
     console.log(answer, err);
        res.status(500).json({ error: err.toString() });
    }
});

app.listen(3000, () => console.log("LLM server running on http://localhost:3000"));
