import React from 'react';
import Navbar from './Navbar';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // TEMPORARY: Disabled auth check for development (no backend yet)
  // const isAuthenticated = authService.isAuthenticated();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default PrivateRoute;

