import mongoose, { Document, Schema, Model } from 'mongoose';

interface UserDocument extends Document {
  username: string;
  password: string;
  email: string;
  role: 'SUPER-ADMINISTRADOR' | 'ADMINISTRADOR' | 'SISTEMAS' | 'VENDEDOR' | 'CLIENTE';
  location: string;
  businessId: string; // Nuevo campo para el ID de negocio
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['SUPER-ADMINISTRADOR', 'ADMINISTRADOR', 'SISTEMAS', 'Vendedor', 'CLIENTE'], default: 'CLIENTE'},
  location: { type: String, required: true },
  businessId: { type: String, default: '0' } // ID de negocio con valor por defecto '0'
}, { timestamps: true });

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
