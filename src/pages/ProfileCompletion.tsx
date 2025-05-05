
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionForm from '@/components/profile/ProfileCompletionForm';

const ProfileCompletion: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-healthhub-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if profile is already completed
  if (userProfile?.profile_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold text-healthhub-blue">HealthHub</h1>
      </div>
      
      <div className="w-full max-w-4xl mx-auto">
        <ProfileCompletionForm />
      </div>
    </div>
  );
};

export default ProfileCompletion;
