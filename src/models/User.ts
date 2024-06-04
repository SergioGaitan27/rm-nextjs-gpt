// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Super Administrador', 'Administrador', 'Sistemas', 'Vendedor', 'Comprador'], default: 'Administrador' }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);