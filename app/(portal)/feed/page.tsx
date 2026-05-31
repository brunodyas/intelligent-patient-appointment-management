"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MagnifyingGlassIcon, PlusIcon } from "@/assets/icons";
import Post from "@/components/Post";
import Button from "@/components/atomics/Button";
import { Pagination, Title } from "@/components/atomics";
import CreatePostModal from "@/components/templates/feed/createPostModal";
import { getPosts } from "@/services/feed";
import { size } from "@/constants/constants";
import { useJune } from "@/hooks/useJune";
import { BiBell } from "react-icons/bi";
import useUserAgent from "@/hooks/usePwa";
import NotificatioPopUp from "@/components/templates/NotificatioPopUp";

type Post = {
  id: number;
  title: string;
  content: string;
  photo?: string;
  user: {
    id: number;
    name: string;
    email: string;
    photo: string;
    franchise: {
      id: number;
      franchise_name: string;
    };
  };
  createdAt: string;
  tags: string;
  tag_subcategories: string;
  like_count: number;
  has_liked: boolean;
};

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [enableNotification, setEnableNotification] = useState<boolean>(false)
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openNotificationPopup, setOpenNotificationPopUp] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState(false);
  const { userAgent, isMobile } = useUserAgent();
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const analytics = useJune();
  const [search, setSearch] = useState("")
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setEnableNotification(Notification.permission === "granted");
    }
  }, [enableNotification]);

  useEffect(() => {
    const container = document.querySelector("main");
    const handleScroll = ({ target }: any) => {
      if (target.scrollTop > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    container?.addEventListener("scroll", handleScroll, false);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchData = useCallback(async (searchValue?: string) => {
    try {
      const response = await getPosts(+page, searchValue);
      analytics?.track("getPosts");
      setPosts(response.results);
      setTotalPages(Math.ceil(response?.count / size));
      let element: HTMLElement | null;
      element = document.getElementById("post-0");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
      element = document.getElementById("feed-page");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      console.error(e);
    }
  }, [page]);

  useEffect(() => {
    fetchData(search);
  }, [page]);

  const handleSearchChange = useCallback((searchValue: string) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      fetchData(searchValue)
    }, 2000);
    setSearch(searchValue)
  }, [])

  useEffect(() => {
    if (page > 1) setPage(1)
  }, [search])

  const handleEnableNotification = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setEnableNotification(true);
      }
    });

    if (Notification.permission === "denied") {
      setOpenNotificationPopUp(true);
    }
  }

  return (
    <>
      <div id="feed-page" className="h-[calc(100vh-88px)] min-[600px]:h-full">
        <CreatePostModal
          SetOpenCreatePost={setOpenCreatePost}
          openCreatePost={openCreatePost}
          fetchData={fetchData}
        />
        <section className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3 max-md:justify-start mb-6">
          <Title variant="primary" size="sm">
            Feed
          </Title>
          <div className="flex flex-row gap-3 max-sm:flex-col max-sm:justify-start max-sm:w-full flex-wrap">
            {!enableNotification &&
              <Button
                size="md"
                variant="primary-bg"
                onClick={() => handleEnableNotification()}
                className="order-3 min-[633px]:order-1"
              >
                <BiBell className="h-4 w-4" />
                Enable Notifications
              </Button>}
            <div className="relative w-72 2xl:w-96 max-sm:w-full order-1 min-[633px]:order-2">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
              <input
                className="w-full border border-transparent bg-neutral-20 px-3.5 py-[9px] pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main rounded-xl"
                placeholder="Search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button
              size="md"
              variant="primary-bg"
              onClick={() => setOpenCreatePost(true)}
              className="order-2 min-[633px]:order-3"
            >
              <PlusIcon className="h-4 w-4 stroke-[10px]" />
              New Post
            </Button>
          </div>
        </section>
        <Tabs.Root
          className="flex min-[600px]:hidden flex-col w-full h-[calc(100%-170px)] min-[480px]:h-[calc(100%-127px)]"
          defaultValue="tab1"
        >
          <Tabs.List className="shrink-0 flex" aria-label="Manage your account">
            <Tabs.Trigger
              className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-base select-none hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:focus:relative outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:bg-active-surface border-b"
              value="tab1"
            >
              Posts
            </Tabs.Trigger>
            <Tabs.Trigger
              className="bg-white px-5 h-[45px] flex-1 flex items-center justify-center text-base select-none hover:text-violet11 data-[state=active]:focus:relative outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:bg-active-surface surface border-b"
              value="tab2"
            >
              RSS Feed
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            className="py-3 min-[480px]:pb-0 h-[calc(100%-45px)]"
            value="tab1"
          >
            <div className="flex flex-col items-center w-full overflow-auto h-full">
              {posts.length > 0 ? (
                <>
                  {posts.map((post, index) => (
                    <Post
                      id={index}
                      postId={post.id}
                      key={post.id}
                      username={post.user.name}
                      content={post.content}
                      initLikes={post.like_count}
                      createdAt={post.createdAt.toString()}
                      photo={post.photo}
                      hasLiked={post.has_liked}
                      franchiseName={post.user.franchise.franchise_name}
                      tags={post.tags}
                      categories={post.tag_subcategories}
                    />
                  ))}

                  <Pagination
                    currentPage={page || 1}
                    totalPages={totalPages || 1}
                    onPageChange={(page) => setPage(page)}
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center">
                  <p className="w-full text-center">No posts available</p>
                </div>
              )}
            </div>
          </Tabs.Content>
          <Tabs.Content className="pt-3" value="tab2">
            <iframe
              className="h-[calc(100vh-325px)] min-[480px]:h-[calc(100vh-272px)] w-full rounded-lg"
              src="https://rss.app/embed/v1/wall/_4PQCZ10SFKcxFvOQ"
            ></iframe>
          </Tabs.Content>
        </Tabs.Root>
        <div className="min-[600px]:grid grid-cols-2 gap-3 hidden pb-3">
          <div className="flex flex-col justify-center items-center w-full">
            {posts.length > 0 ? (
              <>
                {posts.map((post, index) => (
                  <Post
                    id={index}
                    postId={post.id}
                    key={post.id}
                    username={post.user.name}
                    userPhoto={post.user.photo}
                    content={post.content}
                    initLikes={post.like_count}
                    createdAt={post.createdAt.toString()}
                    photo={post.photo}
                    hasLiked={post.has_liked}
                    franchiseName={post.user.franchise.franchise_name}
                    tags={post.tags}
                    categories={post.tag_subcategories}
                  />
                ))}

                <Pagination
                  currentPage={page || 1}
                  totalPages={totalPages || 1}
                  onPageChange={(page) => setPage(page)}
                />
              </>
            ) : (
              <p>No posts available</p>
            )}
          </div>
          <iframe
            className={`${isSticky ? "h-[calc(100vh-95px)]" : "h-[calc(100vh-187px)]"
              } top-0 w-full sticky rounded-lg`}
            src="https://rss.app/embed/v1/wall/_4PQCZ10SFKcxFvOQ"
          ></iframe>
        </div>
      </div>
      {openNotificationPopup && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 z-[99]"
        >
          <NotificatioPopUp
            browserType={userAgent}
            setOpenNotificationPopUp={setOpenNotificationPopUp}
            isMobile={isMobile}
          />
        </div>
      )}
    </>
  );
};

export default Feed;




