### Installation des dépendances

```bash
cd Nuit-info-Sujet-National-Team-NEVERGOON
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
cd appNIRD
npm install
```

### Démarrer le site internet

#### Page principale
```
flask run
```

#### Visualisateur audio
```
cd visualisation-audio
npm run dev
```
