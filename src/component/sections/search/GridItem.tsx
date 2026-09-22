import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SearchResult } from '@/app/api/search/route';

interface GridItemProps {
  item: SearchResult;
  href: string;
}

export const GridItem = React.memo<GridItemProps>(({ item, href }) => {
  return (
    <div className="rounded-lg relative bg-light-300 transition-all duration-300 hover:bg-light-100 p-4">
      {item.image && (
        <Image
          src={item.image.url}
          unoptimized
          width={40}
          height={40}
          alt={item.image.alt || "Logo"}
          className="block mx-auto"
        />
      )}
      <div className="font-supreme font-bold text-[15px] leading-none tracking-[0.15px] text-dark-blue-cm mt-1">
        {item.title}
      </div>
      <Link
        href={href}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';