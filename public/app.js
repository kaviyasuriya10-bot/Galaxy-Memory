let S={user:null,memories:[],edit:null};
const $=x=>document.getElementById(x);

async function api(u,o={}){
  const headers={...(o.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(o.headers||{})};
  const r=await fetch(u,{credentials:'include',...o,headers});
  let d={}; try{d=await r.json()}catch{}
  if(!r.ok) throw Error(d.error||'Request failed');
  return d;
}
function authMode(reg){
  $('name').hidden=!reg; $('name').required=reg;
  $('lt').classList.toggle('active',!reg); $('rt').classList.toggle('active',reg);
  $('authBtn').textContent=reg?'Create my galaxy':'Enter the galaxy';
  $('pass').autocomplete=reg?'new-password':'current-password';
  $('msg').textContent='';
}
async function auth(e){
  e.preventDefault(); $('authBtn').disabled=true; $('msg').textContent='';
  try{
    const reg=!$('name').hidden;
    const d=await api(reg?'/api/register':'/api/login',{
      method:'POST',
      body:JSON.stringify({name:$('name').value,email:$('email').value,password:$('pass').value})
    });
    S.user=d.user; await start();
  }catch(x){$('msg').textContent=x.message}
  finally{$('authBtn').disabled=false}
}
async function start(){
  $('auth').hidden=true; $('app').hidden=false; $('user').textContent=S.user.name; await load();
}
async function load(){S.memories=(await api('/api/memories')).memories;render()}
async function logout(){try{await api('/api/logout',{method:'POST'})}finally{location.reload()}}
function view(v){
  if(!S.user)return;
  ['galaxy','timeline','albums','tags','search','stats'].forEach(x=>$(x).hidden=x!==v);
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  render();
}
function render(){galaxy();timeline();albums();tagList();search();stats()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmtDate(d){if(!d)return 'Undated';try{return new Date(d+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}catch{return d}}
function card(m){
  const img=m.image?`<div class="img has-image" style="background-image:url('/api/image?path=${encodeURIComponent(m.image)}')"></div>`:'<div class="img"><span>✦</span></div>';
  return `<article class="card">${img}<div class="body">
    <div class="card-date">${esc(fmtDate(m.date))}</div><h3>${esc(m.title)}</h3>
    ${m.description?`<p>${esc(m.description)}</p>`:''}
    <div class="chips">${(m.tags||[]).map(t=>`<span class="chip">#${esc(t)}</span>`).join('')}</div>
    <div class="card-actions"><button onclick="openModal('${m.id}')">Edit</button><button class="danger" onclick="del('${m.id}')">Delete</button></div>
  </div></article>`;
}
function galaxy(){
  const sky=$('sky');
  if(!S.memories.length){sky.innerHTML='<div class="empty-orbit"><div class="orbit-glow">✦</div><h3>Your galaxy is waiting.</h3><p>Create your first memory and watch a new star appear.</p><button class="primary" onclick="openModal()">Create first memory</button></div>';return}
  sky.innerHTML=S.memories.map((m,i)=>{
    const a=i*2.39996,r=12+(i%5)*7;
    return `<button class="star" style="left:${50+Math.cos(a)*r}%;top:${50+Math.sin(a)*r*.68}%" onclick="openModal('${m.id}')"><i></i><em>${esc(m.title)}</em></button>`;
  }).join('');
}
function timeline(){$('tl').innerHTML=S.memories.map(card).join('')||'<div class="empty">No memories yet.</div>'}
function albums(){
  const g={}; S.memories.forEach(m=>(m.tags||[]).forEach(t=>(g[t]??=[]).push(m)));
  $('al').innerHTML=Object.entries(g).map(([t,a])=>`<article class="album card"><div class="body"><div class="eyebrow">ALBUM</div><h3>#${esc(t)}</h3><p>${a.length} ${a.length===1?'memory':'memories'}</p>${a.slice(0,3).map(m=>`<div class="album-item">✦ ${esc(m.title)}</div>`).join('')}</div></article>`).join('')||'<div class="empty">Add tags to your memories to create albums.</div>';
}
function tagList(){
  const c={}; S.memories.flatMap(m=>m.tags||[]).forEach(t=>c[t]=(c[t]||0)+1);
  $('tg').innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<button class="tag" onclick="view('search');$('q').value=${JSON.stringify(t)};search()">#${esc(t)} <small>${n}</small></button>`).join('')||'<div class="empty">No tags yet.</div>';
}
function search(){
  const q=($('q')?.value||'').trim().toLowerCase();
  const a=S.memories.filter(m=>!q||[m.title,m.description,m.date,...(m.tags||[])].join(' ').toLowerCase().includes(q));
  if($('sr')) $('sr').innerHTML=a.map(card).join('')||'<div class="empty">No memories match that search.</div>';
}
function stats(){
  const tags=new Set(S.memories.flatMap(m=>m.tags||[])).size, photos=S.memories.filter(m=>m.image).length;
  const latest=S.memories[0]?.date?fmtDate(S.memories[0].date):'—';
  $('st').innerHTML=[
    ['Memories',S.memories.length,'Moments saved'],
    ['Tags',tags,'Ways to explore'],
    ['Photos',photos,'Visual memories'],
    ['Latest',latest,'Most recent date']
  ].map(x=>`<article class="stat-card"><div class="eyebrow">${x[0]}</div><strong>${x[1]}</strong><span>${x[2]}</span></article>`).join('');
}
function openModal(id){
  S.edit=id||null; const m=S.memories.find(x=>x.id===id);
  $('mt').textContent=m?'Edit memory':'New memory';
  $('title').value=m?.title||''; $('desc').value=m?.description||'';
  $('date').value=m?.date||new Date().toISOString().slice(0,10);
  $('memoryTags').value=(m?.tags||[]).join(', '); $('photo').value='';
  $('upload').textContent=m?.image?'Existing photo attached. Choose another to replace it.':'';
  $('modal').hidden=false; setTimeout(()=>$('title').focus(),50);
}
function closeModal(){$('modal').hidden=true;S.edit=null}
async function save(e){
  e.preventDefault();
  const saveBtn=e.submitter; saveBtn.disabled=true;
  try{
    let path; const f=$('photo').files[0];
    if(f){
      $('upload').textContent='Uploading photo…';
      const fd=new FormData(); fd.append('image',f);
      path=(await api('/api/upload',{method:'POST',body:fd})).path;
    }
    const b={title:$('title').value,description:$('desc').value,date:$('date').value,tags:$('memoryTags').value};
    if(path)b.imagePath=path;
    await api(S.edit?`/api/memories?id=${S.edit}`:'/api/memories',{method:S.edit?'PUT':'POST',body:JSON.stringify(b)});
    closeModal(); toast(S.edit?'Memory updated ✦':'Memory added to your galaxy ✦'); await load();
  }catch(x){$('upload').textContent=x.message}
  finally{saveBtn.disabled=false}
}
async function del(id){
  const m=S.memories.find(x=>x.id===id); if(!m)return;
  if(!confirm(`Delete “${m.title}”?`))return;
  try{await api(`/api/memories?id=${id}`,{method:'DELETE'});toast('Memory deleted');await load()}catch(x){toast(x.message)}
}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>t.classList.remove('show'),2600)}
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal').hidden)closeModal()});
(async()=>{try{S.user=(await api('/api/me')).user;await start()}catch{authMode(false)}})();
