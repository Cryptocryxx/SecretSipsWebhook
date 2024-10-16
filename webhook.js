const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const crypto = require('crypto'); // Importiere das crypto-Modul

const app = express();
app.use(bodyParser.json());

const secret = 'fhjemigxkxfdak3483'; // Gib hier das Secret an, das du in GitHub beim Einrichten des Webhooks verwendest

app.post('/webhook', (req, res) => {
    if (!checkSignature(req)) {
        res.status(403).json("Invalid Signature");
    }
  // Führe nur dann git pull aus, wenn die Signatur korrekt ist
  if (req.body.ref === 'refs/heads/main') { // Prüfe, ob der Push auf den 'main'-Branch erfolgt
    exec('cd /home/secret-sips/SecretSipsBackend && git pull && npm i && pm2 restart app.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Fehler bei git pull: ${error}`);
        return res.sendStatus(500); // Fehler beim git pull
      }
      res.sendStatus(200); // Erfolg
    });
  } else {
    res.sendStatus(200); // Ignoriere andere Branches
  }
});

app.post('/webhook/wh', (req, res) => {
  if (!checkSignature(req)) {
      res.status(403).json("Invalid Signature");
  }

// Führe nur dann git pull aus, wenn die Signatur korrekt ist
if (req.body.ref === 'refs/heads/main') { // Prüfe, ob der Push auf den 'main'-Branch erfolgt
  exec('cd /home/secret-sips/SecretSipsWebhook && git pull && pm2 restart webhook.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler bei git pull: ${error}`);
      return res.sendStatus(500); // Fehler beim git pull
    }
    res.sendStatus(200); // Erfolg
  });
} else {
  res.sendStatus(200); // Ignoriere andere Branches
}
});

app.post('/webhook/frontend', (req, res) => {
  if (!checkSignature(req)) {
      res.status(403).json("Invalid Signature");
  }

// Führe nur dann git pull aus, wenn die Signatur korrekt ist
if (req.body.ref === 'refs/heads/main') { // Prüfe, ob der Push auf den 'main'-Branch erfolgt
  exec('cd /home/secret-sips/secret-sips && git pull && pm2 restart secret-sips-frontend', (error, stdout, stderr) => {
    if (error) {
      console.error(`Fehler bei git pull: ${error}`);
      return res.sendStatus(500); // Fehler beim git pull
    }
    console.log(stdout)
    res.sendStatus(200); // Erfolg
  });
} else {
  res.sendStatus(200); // Ignoriere andere Branches
}
});

function checkSignature(req) {
    const signature = req.headers['x-hub-signature'];
    console.log(`Signatur von x-hub: ${signature}`)
    const hmac = crypto.createHmac('sha1', secret); // Erstelle einen HMAC mit dem Secret
    const digest = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex'); // Erzeuge die Hash-Signatur

    // Überprüfe, ob die Signatur der berechneten Hash-Signatur entspricht
    if (signature !== digest) {
    console.log('Ungültige Signatur'); // Logge einen Fehler, wenn die Signaturen nicht übereinstimmen
    return false; // Gib false zurück, wenn die Signatur ungültig ist
    }
    return true;
}

// Starte den Server auf Port 3000
app.listen(3001, () => console.log('Webhook-Listener läuft auf Port 3001'));