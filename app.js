const admin = /^\/admin(?:\/|$)/.test(location.pathname);
const config = window.SITE_CONFIG || {};
const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);
const demo = admin && !configured;
const $ = id => document.getElementById(id);
const uid = () => crypto.randomUUID();
const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const block = (text = lorem, kind = 'text') => ({ id: uid(), kind, text, highlighted: false });
const defaults = {
  name: 'Oscar Öhrn', eyebrow: 'Egna projekt / samlade på ett ställe',
  title: 'Lorem ipsum.', subtitle: 'Dolor sit amet.',
  projectLabel: '01 / Projekt', aboutLabel: '02 / Kontakt',
  intro: [block('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.')],
  projects: [
    {id: uid(), title:'fornsvenska.se', url:'https://fornsvenska.se', upcoming:false, blocks:[block()], tags:'Lorem / Ipsum / Dolor'},
    {id: uid(), title:'omspanska.se', url:'https://omspanska.se', upcoming:false, blocks:[block()], tags:'Lorem / Ipsum / Dolor'}
  ],
  about: [block(), block('Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')]
};
let data = structuredClone(defaults), client, editing = false, dirty = false, saving = false, version = 0;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
}
function field(path, text, tag = 'span', attrs = '') {
  return `<${tag} ${attrs} ${editing ? `contenteditable="plaintext-only" role="textbox" aria-label="${esc(path)}" data-field="${esc(path)}" spellcheck="true"` : ''}>${esc(text)}</${tag}>`;
}
function tools(html) { return editing ? `<div class="edit-tools">${html}</div>` : ''; }
function button(action, path, label) { return `<button type="button" data-action="${action}" data-path="${path}">${label}</button>`; }
function blocks(items, path) {
  return items.map((b,i) => `<div>${field(`${path}.${i}.text`,b.text,b.kind === 'heading' ? 'h3':'p',`class="${b.kind === 'heading' ? 'block-heading':''}" style="${b.highlighted ? 'background:var(--yellow);':''}"`)}${tools(button('highlight',`${path}.${i}`,b.highlighted ? 'Ta bort gult':'Markera gult')+button('remove-block',`${path}.${i}`,'Ta bort'))}</div>`).join('') + tools(button('add-text',path,'+ Text')+button('add-heading',path,'+ Rubrik'));
}
function render() {
  // Uppdatera även den tidigare standardrubriken i sparat innehåll.
  if (typeof data.aboutLabel === 'string') {
    data.aboutLabel = data.aboutLabel.replace(/\bDrivkraft\b/gi, 'Kontakt');
  }
  document.body.classList.toggle('editing',editing);
  document.title = data.name;
  $('site').innerHTML = `<a class="skip" href="#innehall">Till innehållet</a><div class="page">
    <header class="masthead">${field('name',data.name,'span','class="wordmark"')}<nav aria-label="Huvudmeny"><a href="#projekt">Projekt</a><a href="#kontakt">Kontakt</a></nav></header>
    <main id="innehall"><section class="intro" aria-labelledby="intro-title">
      ${field('eyebrow',data.eyebrow,'p','class="eyebrow"')}
      <h1 id="intro-title">${field('title',data.title)}<br><mark>${field('subtitle',data.subtitle)}</mark></h1>
      <div class="intro-copy">${blocks(data.intro,'intro')}</div></section>
    <section class="section" id="projekt" aria-labelledby="project-title">
      ${field('projectLabel',data.projectLabel,'h2','class="section-label" id="project-title"')}<div>
      ${data.projects.map((p,i) => `<article class="project ${p.upcoming ? 'upcoming':''}"><div class="project-content">
        <div class="project-heading"><h3>${editing ? field(`projects.${i}.title`,p.title) : safeUrl(p.url) ? `<a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.title)}<span class="arrow" aria-hidden="true">↗</span></a>` : esc(p.title)}</h3><span class="number">${p.upcoming ? '<span class="status-label">Kommande</span>' : `[${String(i+1).padStart(2,'0')}]`}</span></div>
        ${blocks(p.blocks,`projects.${i}.blocks`)}${field(`projects.${i}.tags`,p.tags,'div','class="meta"')}</div>
        ${tools(`<label>Länk <input type="url" data-field="projects.${i}.url" value="${esc(p.url)}" placeholder="https://exempel.se"></label><label><input type="checkbox" data-upcoming="${i}" ${p.upcoming ? 'checked':''}> Kommande</label>`+button('remove-project',String(i),'Ta bort projekt'))}</article>`).join('')}
      ${tools(button('add-project','','+ Lägg till projekt'))}</div></section>
    <section class="section about" id="kontakt" aria-labelledby="about-title">${field('aboutLabel',data.aboutLabel,'h2','class="section-label" id="about-title"')}<div>${blocks(data.about,'about')}</div></section></main>
    <footer><p>© ${esc(data.name)}</p><a class="back-top" href="#toppen">Till toppen ↑</a></footer></div>`;
}
function at(path) { return path.split('.').reduce((o,k)=>o[k],data); }
function set(path,value) { const keys=path.split('.'); const key=keys.pop(); keys.reduce((o,k)=>o[k],data)[key]=value; }
function status(message) { $('save-status').textContent = message; }
function changed() { dirty = true; status(demo ? 'Demo · osparade ändringar' : 'Osparade ändringar'); }
function bar() {
  $('editor').hidden=false;
  $('editor').innerHTML=`<div class="editor-bar"><p id="save-status" role="status">${demo ? 'Demo · ändringar sparas bara i denna webbläsare':'Klicka i texten för att redigera'}</p><button id="save">${demo ? 'Spara demo':'Spara ändringar'}</button><button id="discard">Ångra osparat</button>${demo ? '' : '<button id="logout">Logga ut</button>'}<a href="/" target="_blank" rel="noopener">Visa sidan ↗</a></div>`;
  $('save').onclick=save;
  $('discard').onclick=async()=>{ if(dirty && !confirm('Ångra alla osparade ändringar?')) return; if(demo) { restoreDemo(); dirty=false; render(); status('Demo återställd till senast sparat'); } else { try { await load(); dirty=false; render(); status('Senast sparade innehåll återställt'); } catch { status('Kunde inte hämta innehållet. Dina ändringar finns kvar.'); } } };
  if(!demo) $('logout').onclick=async()=>{ if(dirty && !confirm('Logga ut och lämna osparade ändringar?'))return; const {error}=await client.auth.signOut(); if(error){status('Kunde inte logga ut. Försök igen.');return;} dirty=false; location.reload(); };
}
$('site').addEventListener('input',event=>{
  const el=event.target.closest('[data-field]'); if(!editing || !el)return;
  set(el.dataset.field,el instanceof HTMLInputElement ? el.value : el.innerText); changed();
});
$('site').addEventListener('change',event=>{
  const el=event.target; if(!editing || !el.hasAttribute('data-upcoming'))return;
  data.projects[Number(el.dataset.upcoming)].upcoming=el.checked; changed(); render();
});
$('site').addEventListener('click',event=>{
  const el=event.target.closest('[data-action]'); if(!editing || !el)return;
  const {action,path}=el.dataset;
  if(action==='add-text'||action==='add-heading') at(path).push(block(action==='add-heading' ? 'Ny rubrik':'Ny text',action==='add-heading'?'heading':'text'));
  if(action==='highlight') at(path).highlighted=!at(path).highlighted;
  if(action==='remove-block') { if(!confirm('Ta bort detta innehåll?'))return; const parts=path.split('.'); const i=Number(parts.pop()); at(parts.join('.')).splice(i,1); }
  if(action==='add-project') data.projects.push({id:uid(),title:'Nytt projekt',url:'',upcoming:true,blocks:[block('Beskriv projektet här.')],tags:''});
  if(action==='remove-project') {if(!confirm('Ta bort projektet?'))return; data.projects.splice(Number(path),1);}
  changed(); render();
});
window.addEventListener('beforeunload',event=>{ if(dirty){ event.preventDefault(); event.returnValue=''; } });
function restoreDemo() { try { data=JSON.parse(localStorage.getItem('oscar-demo')) || structuredClone(defaults); } catch { data=structuredClone(defaults); } }
async function load() {
  const {data:row,error}=await client.from('site_content').select('content,version').eq('id',1).single();
  if(error)throw error; data=row.content || structuredClone(defaults); version=row.version;
}
async function save() {
  if(saving)return;
  const invalid=data.projects.find(p=>p.url && !safeUrl(p.url));
  if(invalid){status(`Ogiltig länk för ${invalid.title}. Använd https:// eller lämna tomt.`);return;}
  saving=true; $('save').disabled=true;
  // Lås redigeringen under sparandet så att nya ändringar aldrig markeras som sparade av misstag.
  $('site').inert=true; $('discard').disabled=true;
  try {
    if(demo) { localStorage.setItem('oscar-demo',JSON.stringify(data)); }
    else {
      const {data:rows,error}=await client.from('site_content').update({content:data,version:version+1}).eq('id',1).eq('version',version).select('version');
      if(error)throw error;
      if(!rows.length)throw new Error('conflict');
      version=rows[0].version;
    }
    dirty=false; status(demo ? 'Demo sparad lokalt · inte publicerad':'Sparat · ändringarna syns på hemsidan');
  } catch(error) { status(error.message==='conflict' ? 'Sparades inte: innehållet har ändrats i en annan session eller behörigheten saknas. Kopiera din text innan du laddar om.' : 'Kunde inte spara. Dina ändringar finns kvar. Kontrollera anslutning och inloggning.'); }
  finally { saving=false; $('site').inert=false; $('save').disabled=false; $('discard').disabled=false; }
}
function showLogin() {
  $('site').hidden=true; $('login').hidden=false;
  $('login').innerHTML='<form class="login"><h1>Oscar Öhrn / admin</h1><p>Logga in för att redigera direkt på sidan.</p><label>E-post<input name="email" type="email" autocomplete="username" required></label><label>Lösenord<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Logga in</button><p id="login-status" class="notice" role="status"></p><a href="/">Till hemsidan</a></form>';
  $('login').querySelector('form').onsubmit=async event=>{
    event.preventDefault(); const form=event.currentTarget; const btn=form.querySelector('button'); btn.disabled=true;
    try { const {error}=await client.auth.signInWithPassword({email:form.elements.email.value,password:form.elements.password.value}); if(error)throw error; await authorize(); }
    catch { $('login-status').textContent='Kunde inte logga in. Kontrollera uppgifter, anslutning och administratörsbehörighet.'; }
    finally{btn.disabled=false;}
  };
}
async function authorize() {
  const {data:result,error}=await client.auth.getUser(); if(error || !result.user)throw new Error('auth');
  const {data:owner,error:ownerError}=await client.from('site_admins').select('user_id').eq('user_id',result.user.id).maybeSingle();
  if(ownerError || !owner)throw new Error('admin');
  await load(); editing=true; $('login').hidden=true; $('site').hidden=false; bar(); render();
}
async function init() {
  if(!configured) { if(demo){ restoreDemo(); editing=true; bar(); } render(); return; }
  try {
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=createClient(config.supabaseUrl,config.supabasePublishableKey);
    if(admin) { showLogin(); const {data:session}=await client.auth.getSession(); if(session.session) {try{await authorize();}catch{$('login-status').textContent='Kontot saknar administratörsbehörighet eller databasen är inte installerad.';}} }
    else {await load(); render();}
  } catch {
    $('notice').hidden=false; $('notice').className='public-error';
    $('notice').textContent=admin ? 'Anslutningen till Supabase kunde inte startas. Kontrollera config.js och försök igen.' : 'Innehållet kunde inte hämtas just nu. Försök igen om en stund.';
  }
}
init();
