import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession(); // Obtiene la sesión actual
  const router = useRouter(); // Para redireccionar después de cerrar sesión

  const hamburgerIconSize = "text-5xl";
  const categoryIconSize = "text-4xl";
  const signOutIconSize = "text-2xl"; // Variable para cambiar el tamaño del icono de cierre de sesión

  const spacingBetweenIcons = "mt-20";
  const spacingBetweenCategoryIcons = "mb-4";
  const iconTextSpacing = 10;

  const sidebarWidthOpen = 256;
  const sidebarWidthClosed = 80;

  const handleMouseEnterHamburger = () => {
    setIsSidebarOpen(true);
  };

  const handleMouseLeaveSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSidebarEnter = () => {
    setIsHoveringSidebar(true);
  };

  const handleSidebarLeave = () => {
    setIsHoveringSidebar(false);
    setIsSidebarOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Ruta de la imagen de perfil o la imagen por defecto
  const profileImageSrc = session?.user?.image || '/images/default-profile.png';

  // Determina el título basado en la ruta actual
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    switch (router.pathname) {
      case '/point-of-sale':
        setPageTitle('Punto de Venta');
        break;
      case '/products':
        setPageTitle('Productos');
        break;
      case '/products/new':
        setPageTitle('Nuevo Producto');
        break;
        case '/transfers':
        setPageTitle('Trasladar Stock');
        break;
      case '/reports':
        setPageTitle('Reportes');
        break;
      case '/orders':
        setPageTitle('Pedidos');
        break;
      default:
        setPageTitle('Dashboard');
    }
  }, [router.pathname]);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 bg-gray-900`}
        style={{ width: isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed }}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleMouseLeaveSidebar}
      >
        <div className={`flex flex-col ${isSidebarOpen ? 'items-start pl-4' : 'items-center'} justify-start pt-4`}>
          <button
            onMouseEnter={handleMouseEnterHamburger}
            className={`${hamburgerIconSize} text-yellow-500 hover:text-yellow-300`}
          >
            &#9776;
          </button>
          <div className={spacingBetweenIcons}></div>
          <Link href="/orders" legacyBehavior>
            <a title="/orders" className={`flex items-center hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>📋</span>
              {isSidebarOpen && <span className="ml-2 text-xl font-semibold" style={{ marginLeft: `${iconTextSpacing}px` }}>Pedidos</span>}
            </a>
          </Link>
          <Link href="/point-of-sale" legacyBehavior>
            <a title="/point-of-sale" className={`flex items-center hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>💵</span>
              {isSidebarOpen && <span className="ml-2 text-xl font-semibold" style={{ marginLeft: `${iconTextSpacing}px` }}>Punto de Venta</span>}
            </a>
          </Link>
          <Link href="/products" legacyBehavior>
            <a title="/products" className={`flex items-center hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>📦</span>
              {isSidebarOpen && <span className="ml-2 text-xl font-semibold" style={{ marginLeft: `${iconTextSpacing}px` }}>Productos</span>}
            </a>
          </Link>
          <Link href="/transfers" legacyBehavior>
            <a title="/transfers" className={`flex items-center hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>🔂</span>
              {isSidebarOpen && <span className="ml-2 text-xl font-semibold" style={{ marginLeft: `${iconTextSpacing}px` }}>Trasladar Stock</span>}
            </a>
          </Link>
          <Link href="/reports" legacyBehavior>
            <a title="/reports" className={`flex items-center hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>📊</span>
              {isSidebarOpen && <span className="ml-2 text-xl font-semibold" style={{ marginLeft: `${iconTextSpacing}px` }}>Reportes</span>}
            </a>
          </Link>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div className={`flex-1 flex flex-col`} style={{ marginLeft: isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed }}>
        {/* Encabezado */}
        <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={toggleProfile} className="focus:outline-none">
                <Image src={profileImageSrc} alt="Perfil" width={40} height={40} className="rounded-full" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2">
                    <p className="font-semibold">{session?.user?.name}</p>
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                    <p className="text-sm text-gray-600">{session?.user?.role}</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleSignOut} className={`${signOutIconSize} focus:outline-none`}>
              <FaSignOutAlt />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;