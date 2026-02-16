import express from 'express';
import User from '../models/user.js';
import Pokemon from '../models/pokemon.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /api/favorites/:pokemonId - Ajouter un favori
router.post('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        
        // Vérifier que le Pokémon existe
        const pokemon = await Pokemon.findOne({ id: pokemonId });
        if (!pokemon) {
            return res.status(404).json({ error: 'Pokémon non trouvé' });
        }
        
        // Ajouter aux favoris (sans doublon avec $addToSet)
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { favorites: pokemonId } },
            { new: true }
        );
        
        res.json({ 
            message: 'Pokémon ajouté aux favoris',
            favorites: user.favorites 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/favorites/:pokemonId - Retirer un favori
router.delete('/:pokemonId', auth, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);
        
        // Retirer des favoris avec $pull
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favorites: pokemonId } },
            { new: true }
        );
        
        res.json({ 
            message: 'Pokémon retiré des favoris',
            favorites: user.favorites 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/favorites - Lister mes Pokémon favoris
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Récupérer les données complètes des Pokémon favoris
        const favoritePokemons = await Pokemon.find({ 
            id: { $in: user.favorites } 
        });
        
        res.json(favoritePokemons);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
