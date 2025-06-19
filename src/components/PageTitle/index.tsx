"use client";

import { useTranslations } from 'next-intl';

interface PageTitleProps {
  titleKey: string;
  subtitleKey?: string;
  features?: Array<{ key: string; color: string }>;
}

function PageTitle({ titleKey, subtitleKey, features = [] }: PageTitleProps) {
  const t = useTranslations();

  const getColorClass = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-500';
      case 'blue': return 'bg-blue-500';
      case 'pink': return 'bg-pink-500';
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-shift 4s ease infinite;
        }
        
        .gradient-title {
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          letter-spacing: -0.025em;
          background: linear-gradient(
            -45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab,
            #7dd3fc,
            #c084fc,
            #fb7185
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease infinite;
          text-shadow: 0 0 30px rgba(238, 119, 82, 0.3);
          filter: drop-shadow(0 0 10px rgba(199, 125, 255, 0.4));
        }
        
        @media (max-width: 768px) {
          .gradient-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
      
      <div className="text-center mb-12">
        <h1 className="gradient-title mb-6">
          {t(titleKey)}
        </h1>
        
        {subtitleKey && (
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t(subtitleKey)}
          </p>
        )}
        
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {features.map((feature) => (
              <div
                key={feature.key}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white ${getColorClass(feature.color)}`}
              >
                {t(feature.key)}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default PageTitle; 