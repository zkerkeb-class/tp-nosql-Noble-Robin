import express from 'express';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/pokemons - Lister tous les Pokémon avec filtres, tri et pagination
router.get('/', async (req, res) => {
    try {
        const { type, name, sort, page = 1, limit = 50 } = req.query;
        
        // Construire le filtre
        const filter = {};
        
        // Filtre par type
        if (type) {
            filter.type = type;
        }
        
        // Recherche par nom (insensible à la casse)
        if (name) {
            filter['name.french'] = { $regex: name, $options: 'i' };
        }
        
        // Calculer skip pour la pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Compter le total de documents avec le filtre
        const total = await Pokemon.countDocuments(filter);
        
        // Construire la requête
        let query = Pokemon.find(filter);
        
        // Appliquer le tri
        if (sort) {
            query = query.sort(sort);
        }
        
        // Appliquer la pagination
        query = query.skip(skip).limit(limitNum);
        
        const pokemons = await query.exec();
        
        // Retourner avec les métadonnées de pagination
        res.json({
            data: pokemons,
            page: pageNum,
            limit: limitNum,
            total: total,
            totalPages: Math.ceil(total / limitNum)
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/pokemons/:id - Récupérer un Pokémon par son ID
router.get('/:id', async (req, res) => {
    try {
        const pokemon = await Pokemon.findOne({ id: parseInt(req.params.id) });
        
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.json(pokemon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/pokemons - Créer un nouveau Pokémon (authentifié)
router.post('/', auth, async (req, res) => {
    try {
        const pokemon = await Pokemon.create(req.body);
        res.status(201).json(pokemon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/pokemons/:id - Modifier un Pokémon (authentifié)
router.put('/:id', auth, async (req, res) => {
    try {
        const pokemon = await Pokemon.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.json(pokemon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/pokemons/:id - Supprimer un Pokémon (authentifié)
router.delete('/:id', auth, async (req, res) => {
    try {
        const pokemon = await Pokemon.findOneAndDelete({ id: parseInt(req.params.id) });
        
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
