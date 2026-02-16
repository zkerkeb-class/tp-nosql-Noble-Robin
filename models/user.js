import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Le nom d\'utilisateur est requis'],
        unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Le mot de passe est requis'],
        minlength: [4, 'Le mot de passe doit contenir au moins 4 caractères']
    },
    favorites: {
        type: [Number],
        default: []
    }
}, {
    timestamps: true
});

// Middleware pre-save pour hasher le mot de passe
userSchema.pre('save', async function() {
    // Ne hasher que si le mot de passe a été modifié
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
