const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey'); // atualize com o caminho correto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// POST "/content"
app.post('/content', async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ['nome', 'descricao', 'categoria', 'instrutor', 'duracaoSemestres', 'certificacao'];

    for (let field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        return res.status(400).send(`Campo obrigatório ausente: ${field}`);
      }
    }

    const docRef = await db.collection('cursos').add(data);
    res.status(201).send({ id: docRef.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET "/contents"
app.get('/contents', async (req, res) => {
  try {
    const snapshot = await db.collection('cursos').get();
    const contents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(contents);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT "/contents/:contentId"
app.put('/contents/:contentId', async (req, res) => {
  try {
    const contentId = req.params.contentId;
    const data = req.body;
    const requiredFields = ['nome', 'descricao', 'categoria', 'instrutor', 'duracaoSemestres', 'certificacao'];

    for (let field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        return res.status(400).send(`Campo obrigatório ausente: ${field}`);
      }
    }

    await db.collection('cursos').doc(contentId).set(data, { merge: true });
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// DELETE "/contents/:contentId"
app.delete('/contents/:contentId', async (req, res) => {
  try {
    const contentId = req.params.contentId;
    await db.collection('cursos').doc(contentId).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});