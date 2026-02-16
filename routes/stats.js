import express from 'express';
import Pokemon from '../models/pokemon.js';

const router = express.Router();

// GET /api/stats - Statistiques avancées avec agrégation
router.get('/', async (req, res) => {
    try {
        // 1. Nombre de Pokémon par type et moyenne des HP par type
        const statsByType = await Pokemon.aggregate([
            { $unwind: '$type' },
            { 
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgHP: { $avg: '$base.HP' },
                    avgAttack: { $avg: '$base.Attack' },
                    avgDefense: { $avg: '$base.Defense' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 2. Pokémon avec le plus d'attaque
        const maxAttack = await Pokemon.findOne()
            .sort({ 'base.Attack': -1 })
            .select('id name type base.Attack');

        // 3. Pokémon avec le plus de HP
        const maxHP = await Pokemon.findOne()
            .sort({ 'base.HP': -1 })
            .select('id name type base.HP');

        // 4. Pokémon avec le plus de défense
        const maxDefense = await Pokemon.findOne()
            .sort({ 'base.Defense': -1 })
            .select('id name type base.Defense');

        // 5. Pokémon le plus rapide
        const maxSpeed = await Pokemon.findOne()
            .sort({ 'base.Speed': -1 })
            .select('id name type base.Speed');

        // 6. Statistiques globales
        const globalStats = await Pokemon.aggregate([
            {
                $group: {
                    _id: null,
                    totalPokemons: { $sum: 1 },
                    avgHP: { $avg: '$base.HP' },
                    avgAttack: { $avg: '$base.Attack' },
                    avgDefense: { $avg: '$base.Defense' },
                    avgSpeed: { $avg: '$base.Speed' },
                    maxHP: { $max: '$base.HP' },
                    maxAttack: { $max: '$base.Attack' }
                }
            }
        ]);

        res.json({
            statsByType,
            records: {
                maxAttack,
                maxHP,
                maxDefense,
                maxSpeed
            },
            globalStats: globalStats[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
