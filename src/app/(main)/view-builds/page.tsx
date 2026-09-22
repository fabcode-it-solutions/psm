import ListView from '@/component/sections/listView/ListView'
import Profile from '@/component/sections/profile/Profile'
import { authOptions } from '@/libs/next-auth/auth';
import { getServerSession } from 'next-auth';
import React from 'react'

const page = async () => {
     const session = await getServerSession(authOptions);    
      const userData = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/user?id=${session?.user.id}`,
        {
          next: {
            tags: ["profile"],
          },
        }
      );
        const user = await userData.json();
  return (
    <div>
      <Profile userData={user} />
      <ListView />
    </div>
  )
}

export default page
