import SearchProduct from '@/component/sections/CreateListings/SearchProduct'
import { authOptions } from '@/libs/next-auth/auth';
import { getServerSession } from 'next-auth';
import React from 'react'

const page =  async () => {
   const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  return (
    <div>
      <SearchProduct userId={ userId ?? 21}/>
    </div>
  )
}

export default page;
