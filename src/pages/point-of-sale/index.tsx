import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import ProductSearch from '@/components/ProductSearch';
import AddedProduct from '@/components/AddedProduct';
import { IProduct } from '@/types/interfaces';

const PointOfSale = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [addedProducts, setAddedProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleAddProduct = (product: IProduct) => {
    setAddedProducts([...addedProducts, { ...product, quantity: 1, selectedPrice: product.price1 }]);
  };

  const handleUpdateProduct = (index: number, updatedProduct: IProduct) => {
    const newAddedProducts = [...addedProducts];
    newAddedProducts[index] = updatedProduct;
    setAddedProducts(newAddedProducts);
  };

  const handleSale = async () => {
    const sales = addedProducts.map(product => ({
      productId: product._id,
      quantity: product.quantity,
      salePrice: product.selectedPrice,
    }));

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales }),
      });

      if (!response.ok) {
        throw new Error('Failed to record sales');
      }

      // Clear the added products after successful sale
      setAddedProducts([]);
      alert('Venta realizada con éxito');
    } catch (error) {
      console.error('Error recording sales:', error);
      alert('Error al realizar la venta');
    }
  };

  return (
    <Layout>
      <div className="flex">
        <div className="w-1/2 p-4">
          <h1>Punto de Venta</h1>
          <ProductSearch products={products} onAddProduct={handleAddProduct} />
        </div>
        <div className="w-1/2 p-4">
          {addedProducts.map((product, index) => (
            <AddedProduct
              key={index}
              product={product}
              onUpdateProduct={(updatedProduct) => handleUpdateProduct(index, updatedProduct)}
            />
          ))}
          <button
            className="mt-4 bg-green-500 text-white p-2 rounded"
            onClick={handleSale}
          >
            Realizar Venta
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PointOfSale;