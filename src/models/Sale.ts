import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  saleType: {
    type: String,
    enum: ['Efectivo', 'Tarjeta', 'Mixto'],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  items: [
    {
      description: { type: String, required: true },
      pieceCode: { type: String, required: true },
      appliedPrice: { type: Number, required: true },
      totalPieces: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  profile: {
    type: String,
    required: true,
  },
  // Campo adicional para análisis
  paymentDetails: {
    cashAmount: { type: Number, default: 0 },
    cardAmount: { type: Number, default: 0 },
    reference: { type: String, default: '' },
  },
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
