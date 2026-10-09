const fs = require('fs');
const path = 'server/index.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "if (atividade.type === 'MULTIPLA_ESCOLHA' || (atividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {";
const replacementStr = "if (atividade.type === 'SAEP' || atividade.type === 'MULTIPLA_ESCOLHA' || (atividade.type === 'PREDICT_OUTPUT' && config.isMultipleChoice)) {";

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Backend patched successfully');
} else {
    console.log('Target string not found in backend');
}
