import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Product from '@/models/Product';
import Sale from '@/models/Sale';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    const { sales } = req.body;

    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ message: 'Invalid sales data' });
    }

    try {
      const salePromises = sales.map(async (sale) => {
        const { productId, quantity, salePrice } = sale;

        // Save the sale
        const newSale = new Sale({ productId, quantity, salePrice });
        await newSale.save();

        // Update the product inventory
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product with id ${productId} not found`);
        }
        product.piecesPerBox -= quantity;
        await product.save();
      });

      await Promise.all(salePromises);

      return res.status(201).json({ message: 'Sales recorded successfully' });
    } catch (error) {
      console.error('Error recording sales:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}