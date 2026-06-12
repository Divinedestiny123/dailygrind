const fetch = require('node-fetch');

async function test() {
  const res = await fetch("https://api.venice.ai/api/v1/models", {
    headers: { "Authorization": "Bearer VENICE_INFERENCE_KEY_s-zDIZVujC9twO_TyEUrUGv0_5yG7JDvCn99SeA14o" }
  });
  const data = await res.json();
  const visionModels = data.data.filter(m => m.id.toLowerCase().includes('vision') || m.id.toLowerCase().includes('vl'));
  console.log("Vision models:", visionModels.map(m => m.id));
}
test();
