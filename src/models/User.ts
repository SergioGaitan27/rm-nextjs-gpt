import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Considera usar bcrypt para hash
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },  // Puedes tener un valor predeterminado para el rol
});

export default mongoose.models.User || mongoose.model('User', UserSchema);