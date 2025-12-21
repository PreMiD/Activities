# 🎨 Image Generator GUI

Una interfaccia grafica moderna per generare immagini usando l'API ElectronHub, senza dover modificare il codice ogni volta.

## ✨ Caratteristiche

- ✅ **GUI intuitiva** - Genera immagini direttamente dal browser
- ✅ **Campo modello personalizzato** - Scrivi il nome del modello che vuoi
- ✅ **Anteprima live** - Vedi l'immagine generata immediatamente
- ✅ **Salvataggio automatico** - Le immagini vengono salvate su Desktop/Photos
- ✅ **Monitoraggio crediti** - Visualizza i crediti rimanenti
- ✅ **Responsive** - Funziona su desktop e tablet
- ✅ **Barra di progresso** - Feedback visivo durante la generazione
- ✅ **Avvio automatico** - Un doppio click per avviare tutto!

## 🚀 Installazione Velocissima

### 1️⃣ Installa Node.js (una sola volta)
Se non lo hai già, scarica da: https://nodejs.org/

### 2️⃣ Scarica i file
Crea una cartella e metti dentro:
- `server.js`
- `index.html`
- `package.json`
- `START.bat` (se su Windows) oppure `START.sh` (se su Mac/Linux)

### 3️⃣ Configura la API Key
Apri `server.js` con un editor di testo (Notepad, VS Code, ecc.) e modifica la riga **13**:

```javascript
// PRIMA:
const API_KEY = "inserisci_la_tua_api_key_qui";

// DOPO:
const API_KEY = "sk-1234567890abcdef";  // ← la tua vera API key
```

### 4️⃣ Avvia il server

**📍 SU WINDOWS:**
- Doppio click su `START.bat`
- Il server si avvia automaticamente
- Il browser apre http://localhost:3000

**📍 SU MAC/LINUX:**
```bash
# Prima volta: dai i permessi
chmod +x START.sh

# Poi ogni volta che vuoi avviare:
./START.sh
```

**O da terminale (qualsiasi OS):**
```bash
npm start
```

## 📝 Come usare

1. **Seleziona il modello** - Scrivi il nome (es: `midjourney-v6.1`, `dall-e-3`)
2. **Scrivi il prompt** - Descrivi l'immagine che vuoi
3. **Clicca "Genera"** - Aspetta che sia creata
4. **Visualizza** - L'immagine appare in anteprima e viene salvata

### Scorciatoie da tastiera
- **Ctrl+Enter** (o Cmd+Enter su Mac) - Genera immagine velocemente

## 🎯 Modelli supportati

Puoi usare qualsiasi modello supportato da ElectronHub:
- `midjourney-v6.1` - Alto dettaglio, ottimo per arte
- `dall-e-3` - Versatile e creativo
- `stable-diffusion-3` - Veloce ed efficiente
- `flux-pro` - Qualità premium

Basta scriverlo nel campo "Modello"!

## 🎨 Prompt Tips

Usa descrizioni dettagliate:
```
❌ "Un gatto"
✅ "Un gatto rosso e bianco che dorme su un cuscino blu, 
   fotografia professionale, illuminazione calda, sfondo sfocato"
```

Includi:
- **Soggetto** principale
- **Dettagli visivi** (colori, texture, materiali)
- **Stile** (fotografico, cartoon, pittura ad olio, ecc.)
- **Illuminazione** e **mood**

## 📂 Struttura progetto

```
project/
├── server.js          # Backend Node.js/Express
├── index.html         # Frontend GUI
├── package.json       # Dipendenze
├── START.bat          # Avvio veloce su Windows
├── START.sh           # Avvio veloce su Mac/Linux
└── README.md          # Questo file
```

## 🔒 Sicurezza della API Key

La API key è memorizzata nel `server.js` e **NON viene mai inviata al browser**. È sicura! 🔐

Se vuoi nasconderla ancora di più, puoi usare un file `.env`:

1. Crea un file `.env` nella stessa cartella:
```
API_KEY=sk-1234567890abcdef
```

2. Modifica `server.js` (riga 12-13):
```javascript
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY || "inserisci_la_tua_api_key_qui";
```

3. Installa dotenv:
```bash
npm install dotenv
```

## 🐛 Troubleshooting

### "Errore: Port 3000 già in uso"
Se il server non parte, significa che la porta 3000 è occupata.

**Soluzione:**
Apri `server.js` e cambia riga 5:
```javascript
const PORT = 3001; // o qualsiasi altro numero
```

### "Errore: Node.js non trovato"
Installa Node.js da https://nodejs.org/

### "L'immagine non appare"
1. Verifica che l'API key sia corretta in `server.js`
2. Controlla i crediti rimanenti nel messaggio
3. Leggi il messaggio di errore nella GUI

### "START.bat non funziona"
- Assicurati di avere Node.js installato
- Prova da terminale: `npm start`

### "START.sh dice 'Permission denied'"
Esegui in terminale:
```bash
chmod +x START.sh
./START.sh
```

## 📊 Cosa succede quando generi

1. Invii il prompt e il modello dal browser
2. Il server lo invia a ElectronHub API
3. L'API genera l'immagine in Base64
4. Il server la salva su Desktop/Photos
5. La GUI mostra un'anteprima
6. Vedi i crediti rimanenti

## 📄 Licenza
MIT - Usalo liberamente!

## 💬 Suggerimenti future

Feature da aggiungere:
- Salvataggio storia prompt
- Dark mode
- Caricamento batch di prompt
- Modifica parametri (size, quality)
- Integrazione social media

---

**Goditi a generare immagini! 🎨**

Domande? Leggi il Troubleshooting sopra oppure controlla la console del browser (F12).
