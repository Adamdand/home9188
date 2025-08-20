// src/components/common/Box.tsx
import React from 'react';

interface BoxProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  id?: string;
}

const MyBox: React.FC<BoxProps> = ({ 
  children, 
  style, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  className,
  id
}) => (
  <div 
    style={style} 
    onClick={onClick} 
    onMouseEnter={onMouseEnter} 
    onMouseLeave={onMouseLeave}
    className={className}
    id={id}
  >
    {children}
  </div>
);

export default MyBox;