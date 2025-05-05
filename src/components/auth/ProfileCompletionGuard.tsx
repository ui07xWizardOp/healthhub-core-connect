
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({ children }) => {
  const { userProfile, isProfileComplete } = useAuth();
  const location = useLocation();

  // If profile is not completed, redirect to profile completion page
  if (userProfile && !isProfileComplete()) {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProfileCompletionGuard;
