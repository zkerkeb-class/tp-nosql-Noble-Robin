import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Vérifier que les champs sont présents
        if (!username || !password) {
            return res.status(400).json({ error: 'Le nom d\'utilisateur et le mot de passe sont requis' });
        }
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Ce nom d\'utilisateur existe déjà' });
        }
        
        // Créer l'utilisateur
        const user = await User.create({ username, password });
        
        res.status(201).json({ 
            message: 'Utilisateur créé avec succès',
            user: {
                id: user._id,
                username: user.username
            }
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Vérifier que les champs sont présents
        if (!username || !password) {
            return res.status(400).json({ error: 'Le nom d\'utilisateur et le mot de passe sont requis' });
        }
        
        // Trouver l'utilisateur
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        
        // Vérifier le mot de passe
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        
        // Générer le token JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
