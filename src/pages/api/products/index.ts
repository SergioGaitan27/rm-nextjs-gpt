import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    const { boxCode, productCode, piecesPerBox, cost, price1, price2, price3, price4, price5, stockLocations } = req.body;

    if (!boxCode || !productCode || !piecesPerBox || !cost || !price1 || !price2 || !price3 || !price4 || !price5 || !stockLocations) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
      const newProduct = new Product({
        boxCode,
        productCode,
        piecesPerBox,
        cost,
        price1,
        price2,
        price3,
        price4,
        price5,
        stockLocations
      });

      const savedProduct = await newProduct.save();

      return res.status(201).json({ message: 'Producto registrado exitosamente', productId: savedProduct._id });
    } catch (error) {
      console.error('Error registrando el producto:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}