import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/app/libs/mongodb';
import Product from '@/models/Product';
import formidable from 'formidable';
import path from 'path';

// Configuración de formidable para manejar archivos subidos
export const config = {
  api: {
    bodyParser: false,
  },
};

interface ProductFields {
  [key: string]: any;
  boxCode?: string;
  productCode?: string;
  name?: string;
  piecesPerBox?: number;
  cost?: number;
  price1?: number;
  price1MinQty?: number;
  price2?: number;
  price2MinQty?: number;
  price3?: number;
  price3MinQty?: number;
  price4?: number;
  price5?: number;
  stockLocations?: any;
  imageUrl?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ message: 'Error obteniendo el producto', error });
      }
      break;

    case 'PUT':
      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public/uploads'),
        keepExtensions: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error procesando la carga de archivos:', err);
          return res.status(500).json({ message: 'Error procesando la carga de archivos' });
        }

        if (!fields) {
          console.error('No se recibieron datos en el formulario');
          return res.status(400).json({ message: 'No se recibieron datos en el formulario' });
        }

        const updateFields: ProductFields = {};

        const fieldNames = [
          'boxCode',
          'productCode',
          'name',
          'piecesPerBox',
          'cost',
          'price1',
          'price1MinQty',
          'price2',
          'price2MinQty',
          'price3',
          'price3MinQty',
          'price4',
          'price5',
          'stockLocations',
        ];

        fieldNames.forEach(field => {
          if (fields && fields[field] !== undefined) {
            const fieldValue = fields[field as keyof typeof fields];
            updateFields[field as keyof ProductFields] = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
          }
        });

        // Mejor manejo de stockLocations
        if (fields.stockLocations) {
          try {
            const stockLocationsValue = Array.isArray(fields.stockLocations) ? fields.stockLocations[0] : fields.stockLocations;
            if (typeof stockLocationsValue === 'string') {
              updateFields.stockLocations = JSON.parse(stockLocationsValue);
            } else {
              updateFields.stockLocations = stockLocationsValue;
            }
          } catch (parseError) {
            console.error('Formato inválido para stockLocations:', parseError);
            return res.status(400).json({ message: 'Formato inválido para stockLocations' });
          }
        }

        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          updateFields.imageUrl = `/uploads/${file.newFilename}`;
        }

        console.log('Campos para actualizar:', updateFields);

        try {
          const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });
          if (!updatedProduct) {
            console.error('Producto no encontrado');
            return res.status(404).json({ message: 'Producto no encontrado' });
          }
          console.log('Producto actualizado exitosamente:', updatedProduct);
          return res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
        } catch (error) {
          console.error('Error actualizando el producto:', error);
          return res.status(500).json({ message: 'Error interno del servidor' });
        }
      });
      break;

    default:
      res.status(405).json({ message: 'Método no permitido' });
      break;
  }
};

export default handler;