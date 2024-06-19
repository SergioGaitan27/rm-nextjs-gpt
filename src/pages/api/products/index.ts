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
  [key: string]: any;  // Permite cualquier propiedad con valor de cualquier tipo
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

  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error procesando la carga de archivos' });
      }

      if (!fields) {
        return res.status(400).json({ message: 'No se recibieron datos en el formulario' });
      }

      // Aquí usamos la interfaz para parsedFields
      const parsedFields: ProductFields = {
        boxCode: Array.isArray(fields.boxCode) ? fields.boxCode[0] : fields.boxCode,
        productCode: Array.isArray(fields.productCode) ? fields.productCode[0] : fields.productCode,
        name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
        piecesPerBox: Array.isArray(fields.piecesPerBox) ? Number(fields.piecesPerBox[0]) : Number(fields.piecesPerBox),
        cost: Array.isArray(fields.cost) ? Number(fields.cost[0]) : Number(fields.cost),
        price1: Array.isArray(fields.price1) ? Number(fields.price1[0]) : Number(fields.price1),
        price1MinQty: Array.isArray(fields.price1MinQty) ? Number(fields.price1MinQty[0]) : Number(fields.price1MinQty),
        price2: Array.isArray(fields.price2) ? Number(fields.price2[0]) : Number(fields.price2),
        price2MinQty: Array.isArray(fields.price2MinQty) ? Number(fields.price2MinQty[0]) : Number(fields.price2MinQty),
        price3: Array.isArray(fields.price3) ? Number(fields.price3[0]) : Number(fields.price3),
        price3MinQty: Array.isArray(fields.price3MinQty) ? Number(fields.price3MinQty[0]) : Number(fields.price3MinQty),
        price4: fields.price4 ? (Array.isArray(fields.price4) ? Number(fields.price4[0]) : Number(fields.price4)) : undefined,
        price5: fields.price5 ? (Array.isArray(fields.price5) ? Number(fields.price5[0]) : Number(fields.price5)) : undefined,
        stockLocations: typeof fields.stockLocations === 'string' ? JSON.parse(fields.stockLocations) : undefined,
      };

      // Validaciones básicas
      if (!parsedFields.boxCode || !parsedFields.productCode || !parsedFields.name) {
        return res.status(400).json({ message: 'Campos boxCode, productCode, y name son necesarios.' });
      }

      let imageUrl = '';
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        imageUrl = `/uploads/${file.newFilename}`;
      }

      try {
        const newProduct = new Product({          ...parsedFields,
          imageUrl,
        });

        const savedProduct = await newProduct.save();
        return res.status(201).json({ message: 'Producto registrado exitosamente', productId: savedProduct._id });
      } catch (error) {
        console.error('Error registrando el producto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const products = await Product.find({});
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error obteniendo los productos:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID del producto no proporcionado' });
    }

    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error procesando la carga de archivos' });
      }
    
      if (!fields) {
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
          // El uso de aserción de tipos para asegurar que el acceso a la propiedad es válido.
          const fieldValue = fields[field as keyof typeof fields];
          updateFields[field as keyof ProductFields] = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
        }
      });

      if (fields.stockLocations) {
        try {
          // Verifica si stockLocations es un array y usa JSON.stringify para convertirlo a string
          const stockLocationsValue = Array.isArray(fields.stockLocations) ? fields.stockLocations[0] : fields.stockLocations;
          updateFields.stockLocations = JSON.parse(stockLocationsValue);
        } catch (parseError) {
          return res.status(400).json({ message: 'Formato inválido para stockLocations' });
        }
      }

      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        updateFields.imageUrl = `/uploads/${file.newFilename}`;
      }

      try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedProduct) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
      } catch (error) {
        console.error('Error actualizando el producto:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
    });
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
};

export default handler;