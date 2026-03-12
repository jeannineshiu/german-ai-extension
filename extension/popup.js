document.getElementById("analyze").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        //func: () => document.body.innerText

        func: () => {

        const article =
            document.querySelector("article") ||
            document.querySelector("main") ||
            document.querySelector("[role='main']");

        return article ? article.innerText : document.body.innerText;
        }




    }, async (results) => {

        const article = results[0].result;

        const response = await fetch("http://localhost:3000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                article: article
            })
        });

        const data = await response.json();

        const parsed = JSON.parse(data.result);

        let html = "";

        parsed.vocabulary.forEach(v => {

        html += `
        <div class="word">

        <div class="word-title">${v.word}</div>

        <div class="pos">${v.part_of_speech}</div>

        <div>中文：${v.meaning_chinese}</div>

        <div>用法：${v.usage_explanation}</div>

        <div>搭配：${v.common_collocation}</div>

        <div>例句：${v.example_sentence}</div>

        </div>
        `;

        });



        document.getElementById("result").innerHTML = html;

            });

});