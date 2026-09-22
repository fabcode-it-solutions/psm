'use client'
import { usePathname } from 'next/navigation';
import MessageSideBar from './MessageSideBar';
import { Chat } from '@/types/chat.types';

const MobileMessageLayout = ({ 
  intialChats, 
  children 
}: { 
  intialChats: { members: Chat[] };
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isInChat = pathname !== '/messages';

  return (
    <div className="h-full relative">
      <div className={`h-full ${isInChat ? 'hidden' : 'block'}`}>
        <MessageSideBar intialChats={intialChats} />
      </div>
      
      <div className={`h-full ${isInChat ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileMessageLayout;