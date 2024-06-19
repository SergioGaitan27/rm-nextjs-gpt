import mongoose, { Document, Schema } from 'mongoose';

interface ISale extends Document {
  productId: string;
  quantity: number;
  salePrice: number;
  createdAt: Date;
}

const SaleSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Sale = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;