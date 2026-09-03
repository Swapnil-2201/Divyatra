import React from 'react';
import { Link } from 'react-router-dom';
import templeEmblemUrl from '../../assets/temple_emblem.png';

export const TempleEmblem = ({ className = "h-9 sm:h-11 w-auto", isDark = false }) => {
  return (
    <img
      src={templeEmblemUrl}
      alt="DivYatra Sacred Temple Emblem"
      className={`${className} object-contain select-none shrink-0 drop-shadow-sm`}
    />
  );
};

export const Logo = ({
  variant = 'full', // 'full' | 'icon' | 'horizontal'
  theme = 'light', // 'light' | 'dark'
  size = 'default', // 'sm' | 'default' | 'lg' | 'xl'
  linkTo = '/',
  className = '',
}) => {
  const isDark = theme === 'dark';

  const emblemSizes = {
    sm: 'h-6 sm:h-8',
    default: 'h-7 sm:h-9 md:h-11',
    lg: 'h-9 sm:h-12 md:h-14',
    xl: 'h-12 sm:h-16 md:h-20',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    default: 'text-[15px] xs:text-lg sm:text-xl md:text-2xl',
    lg: 'text-lg sm:text-2xl md:text-3xl',
    xl: 'text-2xl sm:text-3xl md:text-4xl',
  };

  const subSizes = {
    sm: 'text-[6.5px] sm:text-[7.5px]',
    default: 'text-[6.5px] xs:text-[7.5px] sm:text-[8.5px] md:text-[10px]',
    lg: 'text-[8px] sm:text-[10px] md:text-xs',
    xl: 'text-[10px] sm:text-xs md:text-sm',
  };

  const content = (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 group shrink-0 select-none ${className}`}>
      {/* Temple Artwork Emblem */}
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
        <TempleEmblem
          className={`${emblemSizes[size] || emblemSizes.default} w-auto`}
          isDark={isDark}
        />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col justify-center leading-none shrink-0">
          <div className="flex items-center">
            <span
              className={`font-serif font-black tracking-wider uppercase whitespace-nowrap ${
                titleSizes[size] || titleSizes.default
              } ${isDark ? 'text-white' : 'text-[#102A56]'}`}
            >
              DIV<span className="text-[#D5A63A]">YATRA</span>
            </span>
          </div>
          <span
            className={`font-sans font-bold uppercase tracking-[0.18em] mt-0.5 whitespace-nowrap ${
              subSizes[size] || subSizes.default
            } ${isDark ? 'text-slate-300' : 'text-[#1A3868]'}`}
          >
            Online Temple Bookings
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="focus:outline-none focus-visible:ring-2 ring-[#E97820] rounded-xl inline-flex items-center shrink-0"
      >
        {content}
      </Link>
    );
  }

  return content;
};
