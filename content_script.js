function parseSemanticContent() {
    const title = document.title || null;
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc ? metaDesc.content : null;

    const allowed = new Set(['H1', 'H2', 'H3', 'P', 'LI']);

    // Соберём в порядке страницы
    const all = [...document.querySelectorAll('*')]
        .filter(el => allowed.has(el.tagName));

    // Предварительно соберём li-кандидаты (по длине)
    const liCandidates = all
        .filter(el => el.tagName === 'LI')
        .map(li => li.innerText.trim())
        .filter(text => text.length > 20);

    // Флаг: включаем ли LI вообще
    const includeLI = liCandidates.length <= 160;

    const parts = [];

    // Title и description
    if (title) parts.push(`=== SECTION: ${title} ===`);
    if (description) parts.push(description.trim());

    for (const el of all) {
        const tag = el.tagName;
        const text = el.innerText.trim();
        if (!text) continue;

        if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
            parts.push(`=== SECTION: ${text} ===`);
        } else if (tag === 'P') {
            if (text.length > 4) parts.push(text);
        } else if (tag === 'LI') {
            if (!includeLI) continue;                     // больше 160 → пропуск всех LI
            if (text.length > 20) parts.push(text);
        }
    }

    return parts.join('\n');
    // Использование
    // var aaa3 = parseSemanticContent()
    // console.log(aaa3);
    // var sum33="";
    // aaa3.paragraphs.forEach(n=>sum33+=n+" ")
    // console.log(sum33)
}

let parsedText = parseSemanticContent(); //максимальная длина промпта будет 44.444


console.log(parsedText); 
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_PAGE_DATA") {
        sendResponse({ data: parsedText });
    }
});





