import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      await User.findByIdAndUpdate(id, updates, { new: true });
      res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
