/* eslint-disable react-hooks/rules-of-hooks */
import { AnimatePresence, motion } from "framer-motion";
import IconClose from "@/assets/icons/IconClose";
import IconSearch from "@/assets/icons/IconSearch";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { followService } from "@/services/follow.service";
import { PaginationState } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { useInView } from "react-intersection-observer";
import LoaderDots from "@/component/ui/loader/LoaderDots";
import { useChatContext } from "@/providers/ChatContext";
import { useAppSelector } from "@/libs/redux/hooks";
import { selectUser } from "@/libs/redux/selectors/selectors";

interface StatPopupProps {
  isFollowing?: boolean;
  id?: number;
  item: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
  } | null;
  onClose: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

type User = {
  id: number;
  username: string;
  profileImage: string;
  isMutual?: boolean;
};

const StatPopup: React.FC<StatPopupProps> = ({
  item,
  onClose,
  id,
  refreshUser,
}) => {
  if (!item) return null;
  const { sendNotification } = useChatContext();
  const currentUser = useAppSelector(selectUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [noRecord, setNoRecord] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [results, setResults] = useState<{
    data?: User[];
    pagination?: PaginationState;
  }>();
  const [users, setUsers] = useState<User[]>([]);
  const performSearch = useCallback(async () => {
    if (!searchQuery) {
      setResults({});
      return;
    }
    setIsLoading(true);
    try {
      await getusers();
    } catch (error) {
      console.error("Search error:", error);
      setResults({});
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useDebounce(performSearch, 400, [searchQuery, id]);
  const getusers = async (page?: number) => {
    if (!page) {
      setIsLoading(true);
    }
    const res = await followService.getFollowAndFollowers({
      id,
      type: item.label == "Followers" ? "followers" : "following",
      search: searchQuery || "",
      limit: 5,
      page,
    });
    setResults(res);
    if (page != undefined) {
      console.log(page);
      setUsers((prev) => [...prev, ...res.data]);
    } else {
      setUsers(res.data);
    }
    setTimeout(() => {
      if (!page) {
        setIsLoading(false);
      }
    }, 300);
    setTimeout(() => {
      if (res.data.length == 0) {
        setNoRecord(true);
      } else {
        setNoRecord(false);
      }
    }, 500);
  };
  const isFollowers = item.label === "Followers";
  useEffect(() => {
    (async () => {
      await getusers();
    })();
  }, [item.label]);
  const unfollowUser = useCallback(async (userid: number) => {
    await followService.unfollowUser({
      followerId: Number(id),
      followingId: Number(userid),
    });
    setUsers((prev) => {
      const filtered = prev.filter((item) => item.id != userid);
      return filtered;
    });
    await refreshUser();
  }, []);
  const followUser = useCallback(
    async (userid: number) => {
      await followService.followUser({
        followerId: Number(id),
        followingId: Number(userid),
      });
      setUsers((prev) => {
        const filtered = prev.filter((item) => item.id != userid);
        return filtered;
      });
      sendNotification(
        String(currentUser?.user.notificationId),
        String(currentUser?.user.username),
        String(currentUser?.user.profileImage),
        "is now following you",
        "follow"
      );
      await refreshUser();
    },
    [currentUser]
  );
  const renderActionButton = (user: User) => {
    const baseClass =
      "p-[10px] font-medium rounded-[20px] text-accent-100 text-xl tracking-[-0.17px] leading-[1.35] bg-[#002029]";
    if (user.isMutual) {
      return null;
    }
    const handleClick = () => {
      if (loading) return;
      if (isFollowers) {
        followUser(user.id);
      } else {
        unfollowUser(user.id);
      }
    };

    return (
      <button onClick={handleClick} disabled={loading} className={baseClass}>
        {isFollowers
          ? loading
            ? "Following"
            : "Follow"
          : loading
          ? "Unfollowing"
          : "Unfollow"}
      </button>
    );
  };
  // Intersection observer for infinite scroll
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "50px",
  });

  // Refs
  const ref = useRef<HTMLDivElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (inViewRef) {
        (inViewRef as (instance: HTMLDivElement | null) => void)(node);
      }
    },
    [inViewRef]
  );
  useEffect(() => {
    if (
      inView &&
      !isLoadingMore &&
      results &&
      results.pagination?.currentPage !== results.pagination?.totalPages &&
      results.pagination?.currentPage
    ) {
      setIsLoadingMore(true);
      if (results) {
        getusers(results.pagination.currentPage + 1).finally(() => {
          setIsLoadingMore(false);
        });
      }
    }
  }, [inView, isLoadingMore, results]);
  const shouldShowLoadMore = useMemo(
    () =>
      results &&
      results.pagination?.currentPage !== results.pagination?.totalPages &&
      results.pagination?.currentPage,
    [results]
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl max-w-[567px] w-full mx-auto">
        <div className="bg-white p-2.5 pr-7 rounded-xl shadow-[0px_4px_10px_rgba(0,0,0,0.1)]">
          <div className=" flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-[-0.17px] leading-[1.35]">
              {item.label}
            </h2>
            <button onClick={onClose} className="cursor-pointer">
              <IconClose fill="#002029" />
            </button>
          </div>
          <div className=" relative mt-1">
            <IconSearch className="absolute top-1/2 left-2.5 -translate-y-1/2 max-w-[23px] max-h-[17px]" />
            <input
              type="text"
              placeholder="Search for Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none pl-[43px] placeholder:text-dark-blue-cm text-sm font-poppins text-dark-blue-cm py-[10px] bg-[#E8E8E8] rounded-[6px] w-full mt-1 flex"
            />
          </div>
        </div>

        <SkeletonLoader loading={users.length > 0 ? false : loading} />

        {noRecord && !loading && (
          <div className="text-dark-100 h-20 w-full flex items-center justify-center ">
            No user found.
          </div>
        )}
        <div className="px-[8px] pt-1 max-h-[417px] overflow-auto custom-scrollbar">
          <AnimatePresence>
            {users.length > 0 &&
              !loading &&
              users.map((user, index) => (
                <motion.div
                  key={`user-index-${index}`}
                  className="flex p-[16px] gap-[16px] items-center bg-white rounded-[8px]"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 },
                  }}
                >
                  <Image
                    src={
                      user.profileImage ||
                      "https://overlap-asset.s3.ap-south-1.amazonaws.com/images/4aa6adce0e06f96ffcb97cb37acf96659f50f680_1755595055213.png"
                    }
                    alt={user.username || ""}
                    width={56}
                    height={56}
                    className="rounded-full w-[56px] h-[56px] object-cover"
                  />
                  <h2 className="text-xl font-medium leading-[1.35] tracking-[0.2px] flex-1">
                    {user.username}
                  </h2>
                  {renderActionButton(user)}
                </motion.div>
              ))}
          </AnimatePresence>
          {shouldShowLoadMore && !loading && (
            <div className="py-4" ref={setRefs}>
              <LoaderDots className="!bg-accent-100 !w-3 !h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatPopup;

const SkeletonLoader = ({ loading }: { loading: boolean }) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="skeleton-loader"
          className="px-[8px] pt-1 max-h-[417px] overflow-y-scroll custom-scrollbar"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
            exit: { opacity: 0 },
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={`users-loading-index-${index}`}
              className="flex p-[16px] gap-[16px] items-center bg-white rounded-[8px]"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 0 },
              }}
            >
              {/* Avatar */}
              <motion.div
                className="rounded-full w-[56px] h-[56px] bg-[#002029]/10"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />

              {/* Name */}
              <motion.h2
                className="text-xl font-medium leading-[1.35] tracking-[0.2px] flex-1 bg-[#002029]/10 h-7 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.2 }}
              />

              {/* Button */}
              <motion.span
                className="p-[10px] min-w-[97px] h-[47px] font-medium rounded-[20px] text-xl tracking-[-0.17px] leading-[1.35] bg-[#002029]/10"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.7, delay: 0.4 }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
