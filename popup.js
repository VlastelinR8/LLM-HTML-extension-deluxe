var parsedText;
const maxPromptLength = 44444;
const serverAdress = "http://localhost:3000";     //указывать без слеша на конце из-зи /api/llm
const sendButton = document.getElementById('sendBtn');
const out = document.getElementById('out');
var tplButtons = [];
tplButtons[0] = document.getElementById('tpl1');
tplButtons[1] = document.getElementById('tpl2');
tplButtons[2] = document.getElementById('tpl3');
function splitByChunks(str, chunkSize = maxPromptLength) {
    const result = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        result.push(str.slice(i, i + chunkSize));
    }
    return result;
}
function _getTemplatedPrompt(userPrompt, text) {
 return( 
    `Проанализируй следующий текст:
    === BEGIN TEXT ===
    ${text}
    === END TEXT ===
    ${userPrompt} - помести свой ответ строго в поле out.
    Сгенерируй три коротких промпта на основе этого текста, так или иначе связанные с его темой. - помести их в prompts JSON.
    Верни результат строго в формате JSON:
    {
      "out": "…"
      "prompts": [
        "…",
        "…",
        "…"
      ]
    }`
  )
}

function _getDefaultPrompt(userPrompt,text) {
   return( 
    `Проанализируй следующий текст:
    === BEGIN TEXT ===
    ${text}
    === END TEXT ===
    ${userPrompt}
    `
  )
}


async function sendPromt(prompt) {
  try {
        const response = await fetch(serverAdress+"/api/llm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        let data = await response.text();
        return data;
    } catch (err) {
        out.textContent = "Ошибка: " + err;
    }
}

async function renderPromt(prompt) {

    let responce;
    if (!prompt) {
        out.textContent = "Введите текст запроса.";
        return;
    }

    out.textContent = "Отправка запроса...";
    if(parsedText.length>maxPromptLength) {
        let bunchOfPrompts = splitByChunks(parsedText);
        let compositeResponse = "";
        let bufPrompt;
        for(let i=0;i<bunchOfPrompts.length;i++) {
           bufPrompt = _getDefaultPrompt(prompt,bunchOfPrompts[i]);
           response = await sendPromt(bufPrompt);
           console.log(bufPrompt,"AAAAAAAAAAAAAAA",response);
           compositeResponse += "==="+(i+1)+" RESPONSE=== " + response;
        }
        let compositePrompt = _getTemplatedPrompt(prompt, compositeResponse);
        response = await sendPromt(compositePrompt);
        console.log(compositePrompt,"ABBBBBBAA",response);
        response = JSON.parse(response);
        for(let i=0;i<response.prompts.length;i++) {
           tplButtons[i].textContent = response.prompts[i];
        }
        out.textContent = response.out;
    }
   else {
    prompt = _getTemplatedPrompt(prompt, parsedText);
    response = await sendPromt(prompt);

    response = JSON.parse(response);
        out.textContent = response.out;
        for(let i=0;i<response.prompts.length;i++) {
           tplButtons[i].textContent = response.prompts[i];
        }
   }
  }





chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_DATA" }, response => {
            parsedText = response?.data || "No data";
        console.log(parsedText);
        renderPromt("Выдай краткое содержание.");
        });
});
sendButton.addEventListener('click', () => {
    const userPrompt = document.getElementById('prompt').value.trim();
    console.log(userPrompt);
    renderPromt(userPrompt);
});

for(let tplButton of tplButtons) {
   tplButton.onclick = function() {
       document.getElementById('prompt').value = tplButton.textContent;
       sendButton.click();
   }
}
