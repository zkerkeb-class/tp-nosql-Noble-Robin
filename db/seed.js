import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Pokemon from '../models/pokemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB !');

        // Lire les données depuis pokemons.json
        const dataPath = path.join(__dirname, '../data/pokemons.json');
        const pokemonsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // Supprimer les anciens documents
        await Pokemon.deleteMany({});
        console.log('Collection vidée.');

        // Insérer tous les Pokémon
        const result = await Pokemon.insertMany(pokemonsData);
        console.log(`${result.length} Pokémon insérés avec succès !`);

        // Fermer la connexion
        await mongoose.connection.close();
        console.log('Connexion fermée.');
        
    } catch (error) {
        console.error('Erreur lors du seed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
