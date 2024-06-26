import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find({}, '-password').lean();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
