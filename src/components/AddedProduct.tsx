import { IProduct } from '@/types/interfaces';

interface AddedProductProps {
  product: IProduct;
  onUpdateProduct: (updatedProduct: IProduct) => void;
}

const AddedProduct = ({ product, onUpdateProduct }: AddedProductProps) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProduct({ ...product, quantity: parseInt(e.target.value) });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProduct({ ...product, selectedPrice: parseFloat(e.target.value) });
  };

  return (
    <div className="p-4 border border-gray-300 rounded mb-4">
      <h3>{product.name}</h3>
      <div className="mt-2">
        <label className="block">Cantidad</label>
        <input
          type="number"
          value={product.quantity}
          onChange={handleQuantityChange}
          className="p-2 border border-gray-300 rounded w-full text-black"
        />
      </div>
      <div className="mt-2">
        <label className="block">Precio</label>
        <select
          value={product.selectedPrice}
          onChange={handlePriceChange}
          className="p-2 border border-gray-300 rounded w-full text-black"
        >
          <option value={product.price1}>Precio 1: ${product.price1}</option>
          <option value={product.price2}>Precio 2: ${product.price2}</option>
          <option value={product.price3}>Precio 3: ${product.price3}</option>
          <option value={product.price4}>Precio 4: ${product.price4}</option>
          <option value={product.price5}>Precio 5: ${product.price5}</option>
        </select>
      </div>
    </div>
  );
};

export default AddedProduct;