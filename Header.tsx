import React from 'react';

const StethoscopeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.841 1.343a1.5 1.5 0 0 1 2.122 2.121l-1.34 1.342a9.75 9.75 0 0 1-3.636 2.345l-1.253 1.252a.75.75 0 0 0 .142 1.185l.128.064a.75.75 0 0 0 .809-.07l1.253-1.252a7.25 7.25 0 0 0 2.13-2.733l.215-.43a.75.75 0 1 1 1.342.67l-.215.43a8.75 8.75 0 0 1-11.664 6.273A9.75 9.75 0 0 1 3 13.5V11.75a.75.75 0 0 1 1.5 0V13.5a8.25 8.25 0 0 0 4.633 7.423l.1.05a2.25 2.25 0 0 0 2.228-.052l.094-.05A8.25 8.25 0 0 0 18 13.5V6.75a.75.75 0 0 1 1.5 0v1.925a.75.75 0 1 0 1.5 0V6.75a3 3 0 0 0-3-3V2.25a.75.75 0 0 0-1.5 0V3.75a.75.75 0 0 0 1.5 0V3.75h-1.5a.75.75 0 0 0 0 1.5h1.5v.175a9.752 9.752 0 0 1-4.49 2.033.75.75 0 0 0-.46.853l.03.151a.75.75 0 0 0 .854.46l.15-.03a8.25 8.25 0 0 0 3.79-1.713l1.34-1.34Z" />
    </svg>
);

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <StethoscopeIcon className="h-8 w-8 text-primary-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-tight">
              Trợ lý Chẩn đoán <span className="text-primary-600">Y tế AI</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;