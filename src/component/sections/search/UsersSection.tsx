import React from 'react';
import { motion } from 'framer-motion';
import UserCards, { User } from '../AllCards/UserCards';

interface UsersSectionProps {
  users: User[];
}

export const UsersSection = React.memo<UsersSectionProps>(({ users }) => {
  const motionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div {...motionProps} key="tab-users">
      <div className="my-4">
        <h3 className="text-left text-sm leading-[23px] text-dark-blue-cm relative z-[1] font-audiowide font-normal">
          Users
        </h3>
        <div className="grid text-left grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {users.map((user, index) => (
            <UserCards
              user={user}
              key={`users-popular-${index}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

UsersSection.displayName = 'UsersSection';