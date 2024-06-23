import mongoose, { Schema, Document, Model } from 'mongoose';

interface IStockLocation {
  location: string;
  quantity: number;
}

interface IProduct extends Document {
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
  stockLocations: IStockLocation[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockLocationSchema: Schema = new Schema({
  location: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const ProductSchema: Schema = new Schema({
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
  price4: { type: Number, required: false },
  price5: { type: Number, required: false },
  stockLocations: { type: [StockLocationSchema], required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
