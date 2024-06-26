import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from "@/app/libs/mongodb";
import User from '@/models/User';
import bcrypt from 'bcrypt';

type Data = {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    await connectDB();

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
    }

    try {
      // Verificar si el usuario o el correo electrónico ya existen
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      
      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
        }
        if (existingUser.email === email) {
          return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
      }

      // Hashear la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear nuevo usuario con rol por defecto 'Administrador' y ubicación 'unknown'
      const newUser = new User({ 
        username, 
        email, 
        password: hashedPassword, 
        role: 'Administrador',
        location: 'unknown' // Ubicación por defecto
      });
      await newUser.save();

      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
