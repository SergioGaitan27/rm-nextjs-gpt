import { useState, ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Control del estado inicial del sidebar cerrado
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false); // Controla si el cursor está sobre el sidebar

  // Tamaños de íconos configurables
  const hamburgerIconSize = "text-5xl"; // Tamaño del ícono de hamburguesa
  const categoryIconSize = "text-4xl"; // Tamaño de los íconos de categorías

  // Espacios configurables
  const spacingBetweenIcons = "mt-20"; // Espacio entre el ícono de hamburguesa y los íconos de las categorías
  const spacingBetweenCategoryIcons = "mb-4"; // Espacio entre los íconos de las categorías

  // Anchos configurables en píxeles
  const sidebarWidthOpen = 256; // Ancho del sidebar cuando está abierto (en píxeles)
  const sidebarWidthClosed = 80; // Ancho del sidebar cuando está cerrado (en píxeles)

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

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 bg-gray-900`}
        style={{ width: isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed }}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        {/* Contenedor para los íconos */}
        <div className="flex flex-col items-center justify-start pt-4">
          <button
            onMouseEnter={handleMouseEnterHamburger}
            className={`${hamburgerIconSize} text-yellow-500 hover:text-yellow-300`}
          >
            &#9776; {/* Ícono de hamburguesa Unicode */}
          </button>
          {/* Espacio configurable entre el ícono de hamburguesa y los íconos de categorías */}
          <div className={spacingBetweenIcons}></div>
          <Link href="/point-of-sale" legacyBehavior>
            <a title="/point-of-sale" className={`hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>💵</span>{isSidebarOpen && <span className="ml-2 text-xl">Punto de Venta</span>}
            </a>
          </Link>
          <Link href="/products" legacyBehavior>
            <a title="/products" className={`hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>📦</span>{isSidebarOpen && <span className="ml-2 text-xl">Productos</span>}
            </a>
          </Link>
          <Link href="/reports" legacyBehavior>
            <a title="/reports" className={`hover:bg-yellow-500 hover:text-black rounded transition duration-300 ease-in-out transform hover:scale-110 p-2 ${spacingBetweenCategoryIcons}`}>
              <span className={`${categoryIconSize}`}>📊</span>{isSidebarOpen && <span className="ml-2 text-xl">Reportes</span>}
            </a>
          </Link>
        </div>
      </div>

      {/* Área de contenido principal */}
      <div className={`flex-1 flex flex-col`} style={{ marginLeft: isSidebarOpen ? sidebarWidthOpen : sidebarWidthClosed }}>
        {/* Ajusta el margen izquierdo basado en la visibilidad del sidebar */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;