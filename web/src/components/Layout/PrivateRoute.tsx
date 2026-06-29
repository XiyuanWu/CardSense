import React from 'react';
import Navbar from './Navbar';
import FloatingChatWidget from '../Chat/FloatingChatWidget';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <FloatingChatWidget />
    </>
  );
};

export default PrivateRoute;

