import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getUsers, updateUser, User } from '@/services/userService';

const ManageUsers = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers.filter((user: User) => user.role !== 'Super Administrador'));
        setLoading(false);
      } catch (error) {
        setError('Error al cargar usuarios');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      setUsers(users.map(user => user._id === userId ? { ...user, ...updates } : user));
      setEditingUser(null);
    } catch (error) {
      setError('Error al actualizar el usuario');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.businessId]) {
      acc[user.businessId] = [];
    }
    acc[user.businessId].push(user);
    return acc;
  }, {} as { [key: string]: User[] });

  if (loading) return <div className="text-white">Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Layout>
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
        {editingUser ? (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Editar Usuario</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editingUser._id, {
                  username: editingUser.username,
                  email: editingUser.email,
                  role: editingUser.role,
                  location: editingUser.location,
                  businessId: editingUser.businessId,
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Nombre</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full p-2 rounded text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Correo</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2 rounded text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                  className="w-full p-2 rounded text-black"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Sistemas">Sistemas</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Comprador">Comprador</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Ubicación</label>
                <input
                  type="text"
                  value={editingUser.location}
                  onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                  className="w-full p-2 rounded text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">ID de Negocio</label>
                <input
                  type="text"
                  value={editingUser.businessId}
                  onChange={(e) => setEditingUser({ ...editingUser, businessId: e.target.value })}
                  className="w-full p-2 rounded text-black"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-red-500 text-white p-2 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 text-black p-2 rounded"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        ) : (
          Object.keys(groupedUsers).map(businessId => (
            <div key={businessId} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Negocio ID: {businessId}</h2>
              <table className="w-full text-left border-collapse bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="border p-4">Nombre</th>
                    <th className="border p-4">Correo</th>
                    <th className="border p-4">Rol</th>
                    <th className="border p-4">Ubicación</th>
                    <th className="border p-4">ID de Negocio</th>
                    <th className="border p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedUsers[businessId].map(user => (
                    <tr key={user._id} className="bg-gray-900 odd:bg-gray-800">
                      <td className="border p-4">{user.username}</td>
                      <td className="border p-4">{user.email}</td>
                      <td className="border p-4">{user.role}</td>
                      <td className="border p-4">{user.location}</td>
                      <td className="border p-4">{user.businessId}</td>
                      <td className="border p-4">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-yellow-500 text-black p-2 rounded"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ManageUsers;
