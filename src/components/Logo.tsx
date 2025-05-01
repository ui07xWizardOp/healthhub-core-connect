
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  return (
    <div className="flex items-center">
      <span className={`font-bold ${sizeClasses[size]} text-healthhub-orange`}>
        Health<span className="text-healthhub-blue">Hub</span>
      </span>
    </div>
  );
};

export default Logo;
