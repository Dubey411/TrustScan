'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SecurityBadges from './SecurityBadges';

const LoginInteractive = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center space-y-12">
          {isLoginMode ? (
            <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
          )}
          
          <SecurityBadges />
        </div>
      </div>
    </div>
  );
};

export default LoginInteractive;