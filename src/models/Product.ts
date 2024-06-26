import mongoose, { Document, Schema, Model } from 'mongoose';

interface StockLocation {
  location: string;
  quantity: number;
}

interface ProductDocument extends Document {
  boxCode: string;
  productCode: string;
  name: string;
  piecesPerBox: number;
  cost: number;
  price1: number;
  price1MinQty: number;
  price2: number;
  price2MinQty: number;
  price3: number;
  price3MinQty: number;
  price4?: number;
  price5?: number;
  stockLocations: StockLocation[];
  imageUrl?: string;
}

interface ProductModel extends Model<ProductDocument> {
  reduceStock(productCode: string, quantity: number): Promise<void>;
}

const ProductSchema = new Schema<ProductDocument>({
  boxCode: { type: String, required: true },
  productCode: { type: String, required: true },
  name: { type: String, required: true },
  piecesPerBox: { type: Number, required: true },
  cost: { type: Number, required: true },
  price1: { type: Number, required: true },
  price1MinQty: { type: Number, required: true },
  price2: { type: Number, required: true },
  price2MinQty: { type: Number, required: true },
  price3: { type: Number, required: true },
  price3MinQty: { type: Number, required: true },
  price4: { type: Number },
  price5: { type: Number },
  stockLocations: [{ location: String, quantity: Number }],
  imageUrl: { type: String },
}, { timestamps: true });

ProductSchema.statics.reduceStock = async function (productCode: string, quantity: number) {
  const product = await this.findOne({ productCode });

  if (product) {
    let remainingQty = quantity;

    for (const stock of product.stockLocations) {
      if (stock.quantity >= remainingQty) {
        stock.quantity -= remainingQty;
        remainingQty = 0;
      } else {
        remainingQty -= stock.quantity;
        stock.quantity = 0;
      }

      if (remainingQty === 0) break;
    }

    await product.save();
  } else {
    throw new Error('Producto no encontrado');
  }
};

const Product = (mongoose.models.Product || mongoose.model<ProductDocument, ProductModel>('Product', ProductSchema)) as ProductModel;

export default Product;
