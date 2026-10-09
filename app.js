(() => {
  'use strict';
  const state = { wines: [], beers: [], kind: 'vini', query: '', sort: 'nome', activeWine: null, region: [], cart: JSON.parse(localStorage.getItem('gatsby-cart') || '[]'), assistantResults: [], assistantQuery: '', assistantDetailReturn: false };
  const $ = (selector) => document.querySelector(selector);
  const wineGrid = $('#wine-grid');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const text = (value) => value === null || value === undefined || String(value).trim() === '' ? '' : String(value).trim();
  const typeName = (wine) => {
    const value = (text(wine.colore_tipologia) + ' ' + text(wine.nome_vino) + ' ' + text(wine.tag?.join(' '))).toLocaleLowerCase('it');
    if (/spumante|spumanti|frizzante|metodo classico|bollicin/.test(value)) return 'Bollicine';
    if (/passito|vendemmia tardiva|dolce naturale|moscato dolce|vino dolce|dolce/.test(value)) return 'Dolci';
    if (/rosato|rosé|rose\b/.test(value)) return 'Rosati';
    if (/bianco|blanc|white/.test(value)) return 'Bianchi';
    if (/rosso|red|rouge/.test(value)) return 'Rossi';
    return 'Altri';
  };
  const typeStyle = (category) => ({
    'Bianchi': {accent:'#7caa50',dark:'#486b32',soft:'#edf3df',emoji:'🥂'},
    'Rossi': {accent:'#b84c55',dark:'#91333d',soft:'#f8e6e5',emoji:'🍷'},
    'Rosati': {accent:'#d9829b',dark:'#a74e6b',soft:'#fae8ee',emoji:'🌸'},
    'Bollicine': {accent:'#9b8bdf',dark:'#6553a3',soft:'#eeeafd',emoji:'✨'},
    'Dolci': {accent:'#d5a83c',dark:'#906d1f',soft:'#fbf0cf',emoji:'🍯'},
    'Altri': {accent:'#79917b',dark:'#48664d',soft:'#e9f0e8',emoji:'🍇'}
  }[category] || {accent:'#79917b',dark:'#48664d',soft:'#e9f0e8',emoji:'🍇'});
  const labelImage = (wine) => text(wine.immagine_etichetta);
  const isUnknown = (value) => /da verificare|non disponibile|n\.d\./i.test(text(value));
  const displayValue = (value) => text(value) && !isUnknown(value) ? text(value) : 'Non disponibile';
  const sortValue = (wine, key) => {
    switch (key) {
      case 'colore': return ({'Bianchi':1,'Rossi':2,'Rosati':3,'Bollicine':4,'Dolci':5,'Altri':6}[typeName(wine)] || 9);
      case 'cantina': return text(wine.cantina_produttore).toLocaleLowerCase('it');
      case 'annata': return wine.annata === null || wine.annata === undefined || wine.annata === '' ? 9999 : Number(wine.annata);
      case 'denominazione': return text(wine.denominazione).toLocaleLowerCase('it');
      case 'regione': return text(wine.regione).toLocaleLowerCase('it');
      case 'zona': return text(wine.zona).toLocaleLowerCase('it');
      case 'vitigni': return text(wine.vitigni).toLocaleLowerCase('it');
      case 'gradazione': return wine.gradazione_alcolica_vol === null || wine.gradazione_alcolica_vol === undefined || wine.gradazione_alcolica_vol === '' ? 9999 : Number(wine.gradazione_alcolica_vol);
      case 'metodo': return text(wine.vinificazione).toLocaleLowerCase('it');
      default: return text(wine.nome_vino).toLocaleLowerCase('it');
    }
  };
  const renderCard = (wine) => {
    const category = typeName(wine), style = typeStyle(category), img = labelImage(wine);
    const year = text(wine.annata) || 'Annata n.d.';
    const alcohol = wine.gradazione_alcolica_vol !== null && wine.gradazione_alcolica_vol !== undefined && wine.gradazione_alcolica_vol !== '' ? `${esc(wine.gradazione_alcolica_vol)}% vol` : '';
    const place = [text(wine.regione),text(wine.zona)].filter(Boolean).join(' · ');
    return `<button type="button" class="wine-card" data-wine-id="${esc(wine.id)}" style="--accent:${style.accent};--accent-dark:${style.dark};--soft:${style.soft}" aria-label="Apri la scheda di ${esc(wine.nome_vino)}">
      <div class="card-copy"><span class="type-label">${style.emoji} ${esc(category)}</span><h2>${esc(wine.nome_vino || 'Vino senza nome')}</h2><p class="producer">${esc(wine.cantina_produttore || 'Produttore non indicato')}</p><div class="card-meta">${year !== 'Annata n.d.' ? `<span class="meta-pill">${esc(year)}</span>` : ''}${place ? `<span class="meta-pill">${esc(place)}</span>` : ''}${alcohol ? `<span class="meta-pill">${alcohol}</span>` : ''}</div>${text(wine.profilo_sensoriale) ? `<p class="card-note">${esc(wine.profilo_sensoriale)}</p>` : ''}</div>
      <div class="label-thumb">${img ? `<img src="${esc(img)}" alt="Etichetta di ${esc(wine.nome_vino)}" loading="lazy" onerror="this.remove()">` : ''}<div class="label-placeholder"><span>${style.emoji}</span><small>Etichetta</small></div></div>
    </button>`;
  };
  const getFiltered = () => {
    const q = state.query.toLocaleLowerCase('it');
    return state.wines.filter((wine) => {
      if (state.region.length && !state.region.some(region => text(wine.regione).toLocaleLowerCase('it') === region.toLocaleLowerCase('it'))) return false;
      if (!q) return true;
      const searchable = [wine.nome_vino,wine.cantina_produttore,wine.annata,wine.denominazione,wine.regione,wine.zona,wine.colore_tipologia,wine.vitigni,wine.profilo_sensoriale,wine.curiosita_tecnica_storica,wine.da_bancone,wine.affinamento,wine.vinificazione,...(wine.tag || [])].map(text).join(' ').toLocaleLowerCase('it');
      return searchable.includes(q);
    }).sort((a,b) => {
      const av=sortValue(a,state.sort), bv=sortValue(b,state.sort);
      if (typeof av === 'number' && typeof bv === 'number') return av-bv || text(a.nome_vino).localeCompare(text(b.nome_vino),'it');
      return String(av).localeCompare(String(bv),'it',{numeric:true,sensitivity:'base'}) || text(a.nome_vino).localeCompare(text(b.nome_vino),'it');
    });
  };
  const render = () => {
    const wines = getFiltered();
    wineGrid.innerHTML = wines.map(renderCard).join('');
    $('#results-count').textContent = `${wines.length} ${wines.length === 1 ? 'vino' : 'vini'}`;
    $('#empty-state').hidden = wines.length > 0;
    $('#clear-search').hidden = !state.query;
  };
  const fact = (label, value) => text(value) && !isUnknown(value) ? `<div class="fact"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>` : '';
  const section = (heading, value, className='') => text(value) && !isUnknown(value) ? `<section class="detail-section"><h3>${esc(heading)}</h3><p class="${className}">${esc(value)}</p></section>` : '';
  const openDetail = (wine, fromAssistant = false) => {
    state.activeWine = wine;
    state.assistantDetailReturn = fromAssistant;
    $('#close-detail').textContent = fromAssistant ? '←' : '×';
    $('#close-detail').setAttribute('aria-label', fromAssistant ? 'Torna ai risultati del Sommelier' : 'Chiudi scheda');
    const category = typeName(wine), style = typeStyle(category), img = labelImage(wine);
    const location = [text(wine.zona),text(wine.denominazione),text(wine.annata)].filter(Boolean);
    const facts = [fact('Regione',wine.regione),fact('Zona',wine.zona),fact('Denominazione',wine.denominazione),fact('Annata',wine.annata),fact('Gradazione',wine.gradazione_alcolica_vol !== null && wine.gradazione_alcolica_vol !== undefined && wine.gradazione_alcolica_vol !== '' ? `${wine.gradazione_alcolica_vol}% vol` : ''),fact('Affinamento',wine.affinamento),fact('Vinificazione',wine.vinificazione),fact('Temperatura di servizio',wine.temperatura_servizio_c !== null && wine.temperatura_servizio_c !== undefined && wine.temperatura_servizio_c !== '' ? `${wine.temperatura_servizio_c} °C` : ''),fact('Attendibilità del dato',wine.attendibilita)].filter(Boolean).join('');
    const uncertain = /verificare|media|bassa/i.test([wine.affinamento,wine.note_qualita_dato,wine.attendibilita,wine.fonte_dati].map(text).join(' '));
    $('#detail-content').innerHTML = `<div class="detail-hero" style="--accent:${style.accent};--accent-dark:${style.dark};--soft:${style.soft}"><div><span class="type-label">${style.emoji} ${esc(category)}</span><h2 class="detail-title" id="detail-name">${esc(wine.nome_vino || 'Vino senza nome')}</h2><p class="detail-producer">${esc(wine.cantina_produttore || 'Produttore non indicato')}</p>${section('Vitigni',wine.vitigni)}<div class="detail-location">${location.map((v)=>`<span>${esc(v)}</span>`).join('')}</div></div><div class="detail-label">${img ? `<img src="${esc(img)}" alt="Etichetta di ${esc(wine.nome_vino)}" onerror="this.remove()">` : ''}<div class="label-placeholder"><span>${style.emoji}</span><small>Etichetta da associare</small></div></div></div>
      <div class="detail-divider"></div>${section('Profilo sensoriale',wine.profilo_sensoriale)}${section('Da raccontare al bancone',wine.da_bancone,'bar-quote')}${section('Curiosità tecnica e storica',wine.curiosita_tecnica_storica)}${facts ? `<section class="detail-section"><h3>Dettagli del vino</h3><div class="detail-facts">${facts}</div></section>` : ''}${section('Abbinamenti',Array.isArray(wine.abbinamenti) ? wine.abbinamenti.join(' · ') : wine.abbinamenti)}${section('Tag',Array.isArray(wine.tag) ? wine.tag.join(' · ') : wine.tag)}${uncertain ? `<p class="data-warning">Alcuni dati di questa scheda sono da verificare. I campi mancanti non vengono completati con supposizioni.</p>` : ''}`;
    $('#detail-overlay').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#detail-panel').focus();
  };
  const closeDetail = () => { $('#detail-overlay').hidden = true; document.body.style.overflow = ''; if (state.activeWine && !state.assistantDetailReturn) { const button = document.querySelector(`[data-wine-id="${CSS.escape(String(state.activeWine.id))}"]`); if (button) button.focus(); } state.activeWine = null; state.assistantDetailReturn = false; $('#close-detail').textContent = '×'; $('#close-detail').setAttribute('aria-label','Chiudi scheda'); };
  const setKind = (kind) => {
    state.kind = kind;
    document.querySelectorAll('.main-tab').forEach((button)=>button.classList.toggle('active',button.dataset.kind===kind));
    $('#wine-view').hidden = kind !== 'vini';
    $('#beer-view').hidden = kind !== 'birre';
  };
  document.querySelectorAll('.main-tab').forEach((button)=>button.addEventListener('click',()=>setKind(button.dataset.kind)));
  $('#search').addEventListener('input',(event)=>{state.query=event.target.value;render();});
  $('#clear-search').addEventListener('click',()=>{$('#search').value='';state.query='';render();$('#search').focus();});
  $('#sort-select').addEventListener('change',(event)=>{state.sort=event.target.value;if(state.sort==='regione'){showRegions();return;}state.region=[];render();});
  wineGrid.addEventListener('click',(event)=>{const card=event.target.closest('[data-wine-id]');if(!card)return;const wine=state.wines.find((item)=>String(item.id)===card.dataset.wineId);if(wine)openDetail(wine);});
  $('#close-detail').addEventListener('click',closeDetail);
  $('.overlay-backdrop').addEventListener('click',closeDetail);
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&!$('#detail-overlay').hidden)closeDetail();});
  $('#reset-filters').addEventListener('click',()=>{state.region=[];state.query='';state.sort='nome';$('#search').value='';$('#sort-select').value='nome';render();});
  async function init(){
    try {
      const localDb=localStorage.getItem('gatsby-database');
      let db;
      if(localDb){db=JSON.parse(localDb);}else{const response=await fetch('data/database_vini.json');if(!response.ok)throw new Error(`Caricamento database non riuscito (${response.status})`);db=await response.json();}
      state.wines=Array.isArray(db.vini)?db.vini:[]; state.beers=Array.isArray(db.birre)?db.birre:[];
      $('#wine-count').textContent=state.wines.length;
      $('#beer-count').textContent=Array.isArray(db.birre)?db.birre.length:0;
      $('#data-version').textContent=`DATABASE · VERSIONE ${text(db.versione)||'01'}`;
      render();
    } catch(error) {
      $('#app-error').hidden=false;
      $('#app-error').textContent='Non riesco a caricare il database. Se hai aperto index.html direttamente dal computer, avvia l’app con un server locale oppure pubblicala su GitHub Pages. Dettaglio: '+error.message;
      $('#results-count').textContent='Database non caricato';
    }
  }
  const regions=['Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna','Friuli-Venezia Giulia','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte','Puglia','Sardegna','Sicilia','Toscana','Trentino-Alto Adige','Umbria','Valle d’Aosta','Veneto'];
  function showRegions(){const wrap=$('#region-options');wrap.innerHTML=regions.map(r=>`<button type="button" class="region-option ${state.region.includes(r)?'selected':''}" data-region="${esc(r)}" aria-pressed="${state.region.includes(r)}">${esc(r)}</button>`).join('');$('#region-overlay').hidden=false;}
  $('#region-options').addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(!b)return;const region=b.dataset.region;state.region=state.region.includes(region)?state.region.filter(r=>r!==region):[...state.region,region];b.classList.toggle('selected',state.region.includes(region));b.setAttribute('aria-pressed',String(state.region.includes(region)));});
  $('#apply-regions').addEventListener('click',()=>{$('#region-overlay').hidden=true;$('#sort-select').value='regione';render();});
  $('#clear-region').addEventListener('click',()=>{state.region=[];$('#region-overlay').hidden=true;render();});
  document.querySelectorAll('[data-close-region]').forEach(b=>b.addEventListener('click',()=>$('#region-overlay').hidden=true));
  $('#menu-toggle').addEventListener('click',()=>{ $('#menu-overlay').hidden=false;$('#menu-toggle').setAttribute('aria-expanded','true'); });
  document.querySelectorAll('[data-close-menu]').forEach(b=>b.addEventListener('click',()=>{ $('#menu-overlay').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false'); }));
  document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{const page=b.dataset.page;$('#menu-overlay').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');openPage(page);}));
  document.querySelectorAll('[data-close-page]').forEach(b=>b.addEventListener('click',()=>$('#page-overlay').hidden=true));
  const saveCart=()=>localStorage.setItem('gatsby-cart',JSON.stringify(state.cart));
  function openPage(page){const content=$('#page-content');$('#page-overlay').hidden=false;
    if(page==='dashboard'){content.innerHTML=`<h2>Dashboard</h2><div class="dashboard-stats"><button type="button" data-dashboard-page="vini"><strong>${state.wines.length}</strong><span>Vini nel catalogo</span></button><button type="button" data-dashboard-page="birre"><strong>${state.beers.length}</strong><span>Birre nel catalogo</span></button><button type="button" data-dashboard-page="cart"><strong>${state.cart.length}</strong><span>Prodotti in carrello</span></button></div><p>Catalogo rapido del Piccolo Gatsby.</p><button class="primary-button" data-open-assistant>Apri Sommelier AI</button>`;content.querySelector('[data-open-assistant]').onclick=()=>openPage('assistant');content.querySelector('[data-dashboard-page="cart"]').onclick=()=>openPage('cart');content.querySelector('[data-dashboard-page="vini"]').onclick=()=>{ $('#page-overlay').hidden=true;setKind('vini');window.scrollTo({top:0,behavior:'smooth'}); };content.querySelector('[data-dashboard-page="birre"]').onclick=()=>{ $('#page-overlay').hidden=true;setKind('birre');window.scrollTo({top:0,behavior:'smooth'}); };}
    if(page==='update'){content.innerHTML=`<h2>Aggiorna database</h2><p>Carica uno ZIP che contenga un file <code>database_vini.json</code> (anche dentro una cartella). L'aggiornamento sarà salvato in questo browser e dispositivo.</p><label class="upload-box">Seleziona database ZIP<input id="database-zip" type="file" accept=".zip,application/zip"></label><p class="small-note">Nota: da una web app statica non è possibile sovrascrivere automaticamente i file pubblicati su GitHub per tutti gli utenti. Per una pubblicazione globale, il nuovo database va caricato nel repository.</p><div id="update-status" role="status"></div><button id="reset-database" class="secondary-button">Ripristina database pubblicato</button>`;
      $('#database-zip').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;const status=$('#update-status');try{if(!window.JSZip)throw new Error('Libreria ZIP non disponibile: controlla la connessione.');const zip=await JSZip.loadAsync(file);const entry=Object.values(zip.files).find(f=>!f.dir&&f.name.toLowerCase().endsWith('database_vini.json'));if(!entry)throw new Error('Nel file ZIP non trovo database_vini.json.');const db=JSON.parse(await entry.async('string'));if(!Array.isArray(db.vini))throw new Error('Il JSON non contiene un elenco vini valido.');localStorage.setItem('gatsby-database',JSON.stringify(db));status.textContent=`Database caricato: ${db.vini.length} vini. Ricarica la pagina per applicarlo.`;}catch(err){status.textContent='Aggiornamento non riuscito: '+err.message;}});
      $('#reset-database').onclick=()=>{localStorage.removeItem('gatsby-database');$('#update-status').textContent='Database locale rimosso. Ricarica la pagina per usare quello pubblicato.';};
    }
    if(page==='cart'){content.innerHTML=`<h2>Carrello cantina</h2><p>Annota i vini che vorresti aggiungere in futuro alla cantina.</p><form id="cart-form" class="app-form"><label>Nome vino<input name="name" required placeholder="Nome del vino"></label><label>Cantina / produttore<input name="producer" placeholder="Produttore, se noto"></label><label>Annata<input name="year" placeholder="Es. 2022"></label><label>Foto etichetta (facoltativa)<input name="labelPhoto" type="file" accept="image/*"></label><label>Note<textarea name="notes" rows="3" placeholder="Prezzo, motivo della scelta, contatti…"></textarea></label><button class="primary-button" type="submit">Aggiungi al carrello</button></form><div class="cart-list">${state.cart.map((item,i)=>`<article class="cart-item"><strong>${esc(item.name)}</strong><span>${esc(item.producer||'Produttore non indicato')} ${item.year?'· '+esc(item.year):''}</span>${item.notes?`<p>${esc(item.notes)}</p>`:''}${item.labelPhoto?`<img class="cart-label-photo" src="${item.labelPhoto}" alt="Etichetta di ${esc(item.name)}">`:''}<button data-remove-cart="${i}" class="secondary-button">Rimuovi</button></article>`).join('')||'<p>nessun prodotto nel carrello</p>'}</div>`;
      $('#cart-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);const photoFile=f.get('labelPhoto');let labelPhoto='';if(photoFile&&photoFile.size){if(photoFile.size>1500*1024){alert('La foto deve pesare al massimo 1,5 MB.');return;}labelPhoto=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(photoFile);});}state.cart.push({name:f.get('name'),producer:f.get('producer'),year:f.get('year'),notes:f.get('notes'),labelPhoto});saveCart();openPage('cart');});content.querySelectorAll('[data-remove-cart]').forEach(b=>b.addEventListener('click',()=>{state.cart.splice(Number(b.dataset.removeCart),1);saveCart();openPage('cart');}));
    }
    if(page==='assistant'){content.innerHTML=`<h2>Sommelier AI</h2><p>Descrivi cosa cerca il cliente: colore, gusto, vitigno, zona, abbinamento, occasione o caratteristiche da evitare.</p><form id="assistant-form" class="app-form"><label>Richiesta del cliente<textarea name="prompt" rows="4" required placeholder="Vorrei un rosso morbido, poco tannico, senza sentori di legno…">${esc(state.assistantQuery)}</textarea></label><button class="primary-button" type="submit">Trova corrispondenze</button></form><p class="small-note">Il Sommelier confronta la richiesta con i dati effettivamente presenti nelle schede. Non è ancora collegato a un modello IA online: le proposte sono una ricerca guidata, non una valutazione umana del vino.</p><div id="assistant-results" class="assistant-results"></div><button id="close-assistant-search" class="secondary-button" type="button">Chiudi ricerca e torna al catalogo</button>`;
      const normalize=v=>String(v??'').toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/œ/g,'oe');
      const stop=new Set('vorrei cerca cercare cliente qualcosa simile prodotto prodotti avere avete hanno abbiamo cerco cerchiamo consigliami consiglio trovare trovarei un una uno il lo la le gli dei delle del della di da in su per con senza molto poco poca pochi pochi troppa troppo non che come quale quali sono essere avere magari anche oppure oppure tipo vino vini bottiglia bottiglie cena pranzo occasione cliente budget prezzo euro massimo minimo sotto sopra'.split(' '));
      const aliases={rossi:['rosso','rossa','rossi','rosse'],bianchi:['bianco','bianca','bianchi','bianche'],rosati:['rosato','rosata','rose','rosé'],bollicine:['spumante','spumanti','frizzante','frizzanti','bollicina'],dolci:['dolce','dolci','passito','passiti'],morbido:['morbida','morbidi','morbide','rotondo','rotonda'],tannico:['tannini','tannino','astringente','astringenza'],legno:['barrique','barricato','barricata','botti','botte','legno'],fresco:['fresca','freschi','fresche','acidita'],minerale:['mineralita','sapido','sapida'],fruttato:['fruttata','fruttati','fruttate','frutto'],secco:['secca','secchi','secche'],sardegna:['sardo','sarda','sardi','sarde']};
      const synonyms=new Map();Object.entries(aliases).forEach(([key,vals])=>[key,...vals].forEach(v=>synonyms.set(v,key)));
      const expanded=t=>synonyms.get(t)||t;
      const renderAssistantResults=()=>{const host=$('#assistant-results');if(!state.assistantResults.length){host.innerHTML=state.assistantQuery?'<p class="assistant-no-match">purtroppo non abbiamo niente di simile</p>':'';return;}host.innerHTML=`<h3>Possibili proposte (${state.assistantResults.length})</h3><p class="small-note">Tocca un vino per aprire la scheda. Puoi tornare qui senza perdere la ricerca.</p>${state.assistantResults.map((x,i)=>`<button class="assistant-result" data-assistant-wine="${esc(x.w.id)}"><strong>${esc(x.w.nome_vino)}</strong><span>${esc(x.w.cantina_produttore||'Produttore non indicato')} · ${esc(x.w.regione||'Regione n.d.')}</span><small>Caratteristiche riscontrate: ${esc(x.hits.join(', '))}</small></button>`).join('')}`;host.querySelectorAll('[data-assistant-wine]').forEach(b=>b.addEventListener('click',()=>{const w=state.wines.find(x=>String(x.id)===b.dataset.assistantWine);if(w)openDetail(w,true);}));};
      renderAssistantResults();
      $('#assistant-form').addEventListener('submit',e=>{e.preventDefault();const q=e.target.elements.prompt.value.trim();state.assistantQuery=q;const nq=normalize(q);const raw=nq.split(/[^a-z0-9]+/).filter(t=>t.length>2&&!stop.has(t));const terms=[...new Set(raw.map(expanded))];
        const requestedType=/(\brosso\b|\brosso\b|\brossi\b)/.test(nq)?'Rossi':/(\bbianco\b|\bbianchi\b)/.test(nq)?'Bianchi':/(\brosato\b|\brosati\b|\brose\b)/.test(nq)?'Rosati':/(\bbollicine\b|\bspumante\b|\bfrizzante\b)/.test(nq)?'Bollicine':/(\bdolce\b|\bdolci\b|\bpassito\b)/.test(nq)?'Dolci':null;
        const wantsNoWood=/(senza|non|no)\s+(sentori?\s+di\s+)?(legno|barrique|botti?|affinamento in legno)/.test(nq);const wantsLowTannin=/(poco|basso|bassa|legger[oi])\s+(tannic|tannin|astring)/.test(nq)||/non\s+tannic/.test(nq);const wantsDry=/\b(secco|secca|secchi|secche)\b/.test(nq);const wantsSoft=/\b(morbido|morbida|rotondo|rotonda)\b/.test(nq);const wantsFresh=/\b(fresco|fresca|freschi|fresche)\b/.test(nq);
        const scored=state.wines.map(w=>{const cat=typeName(w);const hay=normalize([w.nome_vino,w.cantina_produttore,w.vitigni,w.colore_tipologia,w.regione,w.zona,w.denominazione,w.profilo_sensoriale,w.abbinamenti,w.da_bancone,w.tag,w.affinamento,w.vinificazione,w.curiosita_tecnica_storica].flat().map(text).join(' '));const hits=terms.filter(t=>hay.includes(t));let score=hits.length;const profile=hay;
          if(requestedType){if(cat!==requestedType)return null;score+=3;hits.push('tipologia '+requestedType.toLowerCase());}
          if(wantsNoWood&&/(legno|barrique|botti|botte|barricat)/.test(profile))return null;
          if(wantsLowTannin&&/(tannic|tannin|astringent)/.test(profile)&&!/(poco tannic|basso tannin|morbido)/.test(profile))return null;
          if(wantsDry&&/(dolce|passito|vendemmia tardiva)/.test(profile)&&!/(secco|secca)/.test(profile))return null;
          if(wantsSoft){if(/morbido|morbida|rotondo|rotonda|vellutato/.test(profile)){score+=2;hits.push('profilo morbido/rotondo');}else return null;}
          if(wantsFresh){if(/fresco|fresca|freschezza|acidita/.test(profile)){score+=2;hits.push('profilo fresco');}else return null;}
          const meaningful=terms.filter(t=>t.length>3);if(!requestedType&&meaningful.length&&hits.length===0)return null;
          return {w,score,hits:[...new Set(hits)].slice(0,6)};
        }).filter(x=>x&&x.score>0).sort((a,b)=>b.score-a.score||String(a.w.nome_vino).localeCompare(String(b.w.nome_vino),'it')).slice(0,8);
        state.assistantResults=scored;renderAssistantResults();
      });
      $('#close-assistant-search').onclick=()=>{state.assistantResults=[];state.assistantQuery='';$('#page-overlay').hidden=true;setKind('vini');window.scrollTo({top:0,behavior:'smooth'});};
    }
  }
  init();
})();
