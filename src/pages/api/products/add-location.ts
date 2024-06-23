import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Product from '@/models/Product';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { newLocation, newQuantity } = req.body;

    if (!newLocation || newQuantity <= 0) {
      return res.status(400).json({ message: 'Datos de nueva ubicación inválidos' });
    }

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      product.stockLocations.push({ location: newLocation, quantity: newQuantity });

      await product.save();
      return res.status(200).json(product);
    } catch (error) {
      console.error('Error agregando nueva ubicación:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
};

export default handler;
