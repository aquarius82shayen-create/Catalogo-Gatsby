(() => {
  'use strict';
  const state = { wines: [], kind: 'vini', category: 'Tutti', query: '', sort: 'nome', activeWine: null };
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
      if (state.category !== 'Tutti' && typeName(wine) !== state.category) return false;
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
  const openDetail = (wine) => {
    state.activeWine = wine;
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
  const closeDetail = () => { $('#detail-overlay').hidden = true; document.body.style.overflow = ''; if (state.activeWine) { const button = document.querySelector(`[data-wine-id="${CSS.escape(String(state.activeWine.id))}"]`); if (button) button.focus(); } state.activeWine = null; };
  const setKind = (kind) => {
    state.kind = kind;
    document.querySelectorAll('.main-tab').forEach((button)=>button.classList.toggle('active',button.dataset.kind===kind));
    $('#wine-view').hidden = kind !== 'vini';
    $('#beer-view').hidden = kind !== 'birre';
  };
  document.querySelectorAll('.main-tab').forEach((button)=>button.addEventListener('click',()=>setKind(button.dataset.kind)));
  document.querySelectorAll('.category-chip').forEach((button)=>button.addEventListener('click',()=>{state.category=button.dataset.category;document.querySelectorAll('.category-chip').forEach((chip)=>chip.classList.toggle('active',chip===button));render();}));
  $('#search').addEventListener('input',(event)=>{state.query=event.target.value;render();});
  $('#clear-search').addEventListener('click',()=>{$('#search').value='';state.query='';render();$('#search').focus();});
  $('#sort-select').addEventListener('change',(event)=>{state.sort=event.target.value;render();});
  wineGrid.addEventListener('click',(event)=>{const card=event.target.closest('[data-wine-id]');if(!card)return;const wine=state.wines.find((item)=>String(item.id)===card.dataset.wineId);if(wine)openDetail(wine);});
  $('#close-detail').addEventListener('click',closeDetail);
  $('.overlay-backdrop').addEventListener('click',closeDetail);
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&!$('#detail-overlay').hidden)closeDetail();});
  $('#reset-filters').addEventListener('click',()=>{state.category='Tutti';state.query='';state.sort='nome';$('#search').value='';$('#sort-select').value='nome';document.querySelectorAll('.category-chip').forEach((chip)=>chip.classList.toggle('active',chip.dataset.category==='Tutti'));render();});
  async function init(){
    try {
      const response=await fetch('data/database_vini.json');
      if(!response.ok)throw new Error(`Caricamento database non riuscito (${response.status})`);
      const db=await response.json();
      state.wines=Array.isArray(db.vini)?db.vini:[];
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
  init();
})();
