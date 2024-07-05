import { useState } from 'react';
import Link from 'next/link';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

Modal.setAppElement('#__next');

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '', username: '' });
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const allValidationsPassed = () => {
    return Object.values(passwordValidations).every(value => value === true);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /\d/.test(password);
    const specialChar = /[@$!%*?&]/.test(password);

    const validations = { length, uppercase, lowercase, number, specialChar };
    setPasswordValidations(validations);

    // Evalúa todos los criterios de validación aquí mismo
    const allValid = Object.values(validations).every(value => value === true);
    setShowPasswordRequirements(!allValid); // Actualiza la visibilidad aquí
    return allValid;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword); // Llama a validatePassword aquí para actualizar las validaciones
  };
  
  const handlePasswordKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const newPassword = (e.target as HTMLInputElement).value;
    setShowPasswordRequirements(!allValidationsPassed()); // Evalúa la necesidad de mostrar los requisitos
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrors(prev => ({ ...prev, username: '' }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setErrors(prev => ({ ...prev, email: 'Por favor, introduce un correo electrónico válido.' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email) || !validatePassword(password)) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(email) ? '' : 'Por favor, introduce un correo electrónico válido.',
        password: validatePassword(password) ? '' : 'La contraseña debe cumplir con todos los requisitos.',
        general: ''
      }));
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        setModalIsOpen(true);
      } else {
        const data = await response.json();
        if (data.message === 'El nombre de usuario ya está registrado.') {
          setErrors(prev => ({ ...prev, username: data.message, general: '' }));
        } else if (data.message === 'El correo electrónico ya está registrado.') {
          setErrors(prev => ({ ...prev, email: data.message, general: '' }));
        } else {
          setErrors(prev => ({ ...prev, general: data.message }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Error al registrar' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Regístrate en tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/" className="font-medium text-yellow-400 hover:text-yellow-300">
              Inicia sesión ahora
            </Link>
          </p>
          {errors.general && (
            <div className="bg-red-500 text-white p-2 rounded mt-2 text-center">
              {errors.general}
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Nombre de usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-700'} placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm`}
                placeholder="Nombre de usuario"
                value={username}
                onChange={handleUsernameChange}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-700'} placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm`}
                placeholder="Correo electrónico"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-700'} placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm`}
                placeholder="Contraseña"
                value={password}
                onChange={handlePasswordChange} // Maneja el cambio de valor
                onKeyUp={handlePasswordKeyUp}   // Actualiza la visibilidad de los requisitos
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.password}</p>}
              {showPasswordRequirements && (
                <ul className="text-xs mt-1.5 space-y-1 mb-1.5">
                  <li className={`flex items-center ${passwordValidations.length ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidations.length ? <FaCheck /> : <FaTimes />} 
                    <span className="ml-2">Al menos 8 caracteres</span>
                  </li>
                  <li className={`flex items-center ${passwordValidations.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidations.uppercase ? <FaCheck /> : <FaTimes />}
                    <span className="ml-2">Al menos una letra mayúscula</span>
                  </li>
                  <li className={`flex items-center ${passwordValidations.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidations.lowercase ? <FaCheck /> : <FaTimes />}
                    <span className="ml-2">Al menos una letra minúscula</span>
                  </li>
                  <li className={`flex items-center ${passwordValidations.number ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidations.number ? <FaCheck /> : <FaTimes />}
                    <span className="ml-2">Al menos un número</span>
                  </li>
                  <li className={`flex items-center ${passwordValidations.specialChar ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidations.specialChar ? <FaCheck /> : <FaTimes />}
                    <span className="ml-2">Al menos un carácter especial (@$!%*?&)</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <div>
            <button type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">  {/* Añadido border border-yellow-400 */}
          <h2 className="text-2xl font-bold text-white mb-4">Registro exitoso</h2>
          <p className="text-gray-400 mb-4">Te has registrado exitosamente.</p>
          <button
            onClick={() => {
              setModalIsOpen(false);
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
          >
            Iniciar sesión
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;