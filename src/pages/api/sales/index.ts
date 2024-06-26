import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const sale = new Sale(req.body);

      // Actualizar el stock de los productos
      for (const item of sale.items) {
        await Product.reduceStock(item.pieceCode, item.totalPieces);
      }

      await sale.save({ session });
      await session.commitTransaction();
      session.endSession();
      res.status(201).json({ success: true, data: sale });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Método no permitido' });
  }
}
