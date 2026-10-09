# VINI Gatsby — CATALOGO

Prima versione della web app per consultare rapidamente le schede dei vini del bar.

## Funzionalità incluse
- Catalogo dei 65 vini presenti nel database fornito.
- Filtri rapidi per Bianchi, Rossi, Rosati, Bollicine e Dolci.
- Ricerca per nome, produttore, vitigno, annata, denominazione, zona e testo descrittivo.
- Ordinamento per colore, nome, produttore, annata crescente, denominazione, regione, zona, vitigni, gradazione crescente e metodo di produzione.
- Scheda di dettaglio con profilo sensoriale, curiosità, frase da bancone e dati tecnici disponibili.
- Gestione dei campi mancanti senza inventare valori; segnaposto per etichette non ancora associate.
- Sezione Birre predisposta, in attesa del relativo database.
- Layout adattivo per computer e smartphone, senza framework o passaggi di compilazione.

## Pubblicazione su GitHub Pages
1. Estrai tutti i file dello ZIP.
2. Carica nel repository GitHub il contenuto della cartella (in modo che `index.html` si trovi nella radice del repository).
3. In **Settings → Pages**, seleziona il branch da pubblicare e la cartella `/ (root)`.
4. Apri l'indirizzo GitHub Pages generato.

Per provare l'app sul computer, usa un server statico dalla cartella del progetto, ad esempio con Python: `python -m http.server 8000`, quindi apri `http://localhost:8000`. Non è sufficiente aprire `index.html` direttamente con doppio clic perché il browser può bloccare il caricamento del database JSON.

## Aggiornare il database
Il file usato dall'app è `data/database_vini.json`. La struttura di partenza è stata mantenuta. Per un aggiornamento futuro, sostituisci il JSON con una versione compatibile che contenga l'array `vini`; il campo `birre` può essere aggiunto quando disponibile. Le immagini possono essere indicate in `immagine_etichetta` usando un percorso relativo presente nel repository o un URL raggiungibile.

## File principali
- `index.html`: struttura della pagina.
- `styles.css`: grafica e layout responsive.
- `app.js`: ricerca, filtri, ordinamenti e schede.
- `data/database_vini.json`: database strutturato usato dall'app.
- `data/database_vini.csv`: esportazione tabellare originale.
- `data/README.md`: note originali sul database.
