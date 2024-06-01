import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Aseguramos que `global.mongoose` esté definido
declare global {
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    };
}

// Inicializamos `global.mongoose` si no está definido
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000, // 5 segundos
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose.connection; // Devolvemos la conexión, no la instancia de mongoose
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Reiniciar la promesa en caso de error
        throw e;
    }

    return cached.conn;
}