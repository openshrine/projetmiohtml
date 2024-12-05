const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://miomariage:89fdrFz5mr77Ch6w@mio.n31s6.mongodb.net/?retryWrites=true&w=majority&appName=Mio";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDB() {
    try {
        await client.connect();
        console.log("Connecté à MongoDB Atlas !");
        const db = client.db('<dbname>');
        return db;
    } catch (err) {
        console.error("Erreur de connexion :", err);
    }
}

module.exports = connectToDB;
