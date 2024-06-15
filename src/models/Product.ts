import mongoose, { Schema, Document, Model } from 'mongoose';

interface IStockLocation {
  location: string;
  quantity: number;
}

interface IProduct extends Document {
  boxCode: string;
  productCode: string;
  piecesPerBox: number;
  cost: number;
  price1: number;
  price2: number;
  price3: number;
  price4: number;
  price5: number;
  stockLocations: IStockLocation[];
  createdAt: Date;
  updatedAt: Date;
}

const StockLocationSchema: Schema = new Schema({
  location: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const ProductSchema: Schema = new Schema({
  boxCode: { type: String, required: true },
  productCode: { type: String, required: true },
  piecesPerBox: { type: Number, required: true },
  cost: { type: Number, required: true },
  price1: { type: Number, required: true },
  price2: { type: Number, required: true },
  price3: { type: Number, required: true },
  price4: { type: Number, required: true },
  price5: { type: Number, required: true },
  stockLocations: { type: [StockLocationSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;