import React, { FC, JSX, ReactNode } from 'react';

type HeadingProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
};

const baseStyles: Record<number, string> = {
  1: 'text-[#002029] text-[26px] font-bold text-center leading-[1.4] font-supreme max-tab-sm:text-[22px]',
  2: 'text-[20px] tracking-[-0.17px]  font-bold',
  3: "text-[28px] font-medium leading-[1.3573] tracking-[0.28px]",
  4: '',
  5: '',
  6: 'text-sm leading-[16px] text-center font-sofia-sans font-normal',
};

const Heading: FC<HeadingProps> = ({ level = 1, children, className = '' }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClass = `${baseStyles[level] || baseStyles[1]} ${className}`;

  return <Tag className={headingClass}>{children}</Tag>;
};

export default Heading;
        