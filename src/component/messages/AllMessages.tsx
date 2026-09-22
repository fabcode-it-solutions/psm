'use client'
import { MessageSquareMore } from 'lucide-react'
import React from 'react'

const AllMessages = () => {
  return (
    <div className='flex items-center justify-center w-full h-full max-md:hidden'>
    <div className='text-center px-4'>
      <MessageSquareMore className='w-16 h-16 max-md:w-12 max-md:h-12 text-dark-100/20 block mx-auto' />
      <div className='text-[32px] max-md:text-xl text-center font-bold whitespace-nowrap max-md:whitespace-normal font-supreme mt-4 max-md:mt-3 mb-2 leading-[1.3438] tracking-[0.32px] text-dark-blue-cm max-tab-lg:text-xl'>Welcome to your chats</div>
      <p className='text-base max-md:text-sm text-center font-normal font-supreme leading-[1.3438] tracking-[0.32px] text-dark-blue-cm max-tab-lg:text-xl'>Select a conversation from the left to get started.</p>      
    </div>
    </div>
  )
}

export default AllMessages
