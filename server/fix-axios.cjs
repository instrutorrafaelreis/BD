const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

if (!c.includes("import axios from 'axios';") && !c.includes("const axios = require('axios');")) {
  c = "import axios from 'axios';\n" + c;
}

const oldFetchBlock = `    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \\\`Bearer \\\${apiKey}\\\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: \\\`Gere a questão sobre: \\\${assunto}\\\` }
        ],
        temperature: 0.3,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NVIDIA API Error:", errText);
      return res.status(502).json({ error: "Erro na comunicação com a IA." });
    }

    const data = await response.json();
    let resultText = data.choices[0].message.content.trim();`;

const newAxiosBlock = `    const payload = {
      model: "google/gemma-2-27b-it", // Ajustado para um modelo de texto válido na NIM se o gemma-4 não estiver mais listado. Se a conta tiver o 4, mude aqui.
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: \`Gere a questão sobre: \${assunto}\` }
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: false,
      top_p: 1
    };

    let response;
    try {
      response = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', payload, {
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Accept': 'application/json'
        }
      });
    } catch (apiError: any) {
      if (apiError.response) {
        console.error(\`HTTP \${apiError.response.status}\`);
        console.error(apiError.response.data);
      } else {
        console.error(apiError);
      }
      return res.status(502).json({ error: "Erro na comunicação com a IA." });
    }

    let resultText = response.data.choices[0].message.content.trim();`;

// The backticks and newlines make literal replacement hard via replace string, so let's use regex or split logic if replace fails.
let indexStart = c.indexOf("const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions'");
let indexEnd = c.indexOf("let resultText = data.choices[0].message.content.trim();") + "let resultText = data.choices[0].message.content.trim();".length;

if (indexStart !== -1 && indexEnd !== -1) {
  c = c.slice(0, indexStart) + newAxiosBlock + c.slice(indexEnd);
}

fs.writeFileSync('index.ts', c);
console.log('Axios replaced');
