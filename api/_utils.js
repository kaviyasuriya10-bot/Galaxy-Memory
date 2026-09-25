function send(res,s,b){return res.status(s).json(b)}
function body(req){return req.body&&typeof req.body==='object'?req.body:{}}
function tags(v){return Array.isArray(v)?[...new Set(v.map(x=>String(x).trim().toLowerCase()).filter(Boolean))].slice(0,20):String(v||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,20)}
function normalize(m){return {id:m.id,title:m.title,description:m.description||'',date:m.memory_date||'',tags:m.tags||[],image:m.image_path||null,createdAt:m.created_at,updatedAt:m.updated_at}}
module.exports={send,body,tags,normalize};
