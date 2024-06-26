export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'Super Administrador' | 'Administrador' | 'Sistemas' | 'Vendedor' | 'Comprador';
    location: string;
    businessId: string; // Asegúrate de que este campo esté presente
  }
  
  export const getUsers = async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }
    return await response.json();
  };
  
  export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar usuario');
    }
    return await response.json();
  };
  