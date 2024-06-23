import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Product from '@/models/Product';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { fromLocation, toLocation, transferQuantity } = req.body;

    if (!fromLocation || !toLocation || transferQuantity <= 0) {
      return res.status(400).json({ message: 'Datos de transferencia inválidos' });
    }

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const fromStock = product.stockLocations.find((loc: { location: string }) => loc.location === fromLocation);
      const toStock = product.stockLocations.find((loc: { location: string }) => loc.location === toLocation);

      if (!fromStock || fromStock.quantity < transferQuantity) {
        return res.status(400).json({ message: 'Cantidad insuficiente en la ubicación de origen' });
      }

      fromStock.quantity -= transferQuantity;
      if (toStock) {
        toStock.quantity += transferQuantity;
      } else {
        product.stockLocations.push({ location: toLocation, quantity: transferQuantity });
      }

      await product.save();
      return res.status(200).json(product);
    } catch (error) {
      console.error('Error transfiriendo existencias:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
};

export default handler;
