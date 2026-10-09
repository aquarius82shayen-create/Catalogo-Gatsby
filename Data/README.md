# Database Vini — versione 01

Record inclusi: 65  
Data: 2026-10-09

## File
- `database_vini.json`: archivio strutturato principale.
- `database_vini.csv`: esportazione tabellare.
- `README.md`: istruzioni e convenzioni.

## Convenzioni
- I dati mancanti sono `null`; quelli incerti sono esplicitamente marcati come da verificare.
- `curiosita_tecnica_storica` deve offrire sempre uno spunto non banale: storia del produttore, territorio, denominazione o vitigno.
- `da_bancone` deve essere breve, naturale, tecnicamente interessante e non spiegare ovvietà.
- Le valutazioni sensoriali 1–5 sono predisposte ma lasciate vuote per evitare falsa precisione; verranno compilate con criterio coerente.
- `immagine_etichetta` è `null`: le etichette frontali saranno associate e ritagliate con uno standard grafico comune.
- Le schede con attendibilità media/bassa vanno verificate su retroetichetta e fonti ufficiali prima dell'uso definitivo.

## Per la web app
Filtri oggettivi: colore, regione, zona, denominazione, vitigno, gradazione.  
Suggerimenti: combinare filtri oggettivi con tag e scale sensoriali; mostrare sempre la motivazione del consiglio.  
Non convertire automaticamente descrizioni testuali in punteggi numerici senza revisione.
