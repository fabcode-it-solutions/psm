import { MessageSquareMore } from "lucide-react";

const LoaderState = () => (
  <div className="flex-1 flex flex-col bg-gray-50">
    <div className="flex items-center px-6 py-4 bg-[#F7F7FC] gap-4 animate-pulse">
      <div className="rounded-full w-[60px] h-[60px] bg-dark-blue-cm/10" />
      <div className="flex flex-col gap-2 w-1/2">
        <div className="h-6 bg-dark-blue-cm/10 rounded-md" />
        <div className="h-4 bg-dark-blue-cm/10 rounded-md w-1/3" />
      </div>
    </div>
  </div>
);
export default LoaderState;
export const EmptyState = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="text-center">
      <MessageSquareMore className="w-16 h-16 text-dark-100/20 mx-auto" />
      <h2 className="text-[32px] font-bold mt-4 mb-2 text-dark-blue-cm">
        Welcome to your chats
      </h2>
      <p className="text-base text-dark-blue-cm">
        Select a conversation from the left to get started.
      </p>
    </div>
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="text-center">
      <MessageSquareMore className="w-16 h-16 text-dark-100/20 mx-auto" />
      <h2 className="text-[32px] font-bold mt-4 mb-2 text-dark-blue-cm">
        {message}
      </h2>
    </div>
  </div>
);
