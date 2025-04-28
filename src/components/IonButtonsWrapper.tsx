// src/components/IonButtonsWrapper.tsx
import React from 'react';

interface IonButtonsProps {
  children: React.ReactNode;
  slot?: string;
}

const IonButtons: React.FC<IonButtonsProps> = ({ children, slot }) => {
  return (
    <div className={`ion-buttons ${slot ? `ion-buttons-${slot}` : ''}`}>
      {children}
    </div>
  );
};

export default IonButtons;