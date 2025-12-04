import { pipeline, env } from "./libs/transformers.min.js";



let pipe = null;

onmessage = async (ev) => {
    const { text, modelPath1 } = ev.data;
    env.backends.onnx.wasm = false;
    env.blobs = false;
    if (!pipe) {
        pipe = await pipeline("text-generation", "Xenova/gpt2");
    }

    const result = await pipe(text);
    postMessage(result);
};
