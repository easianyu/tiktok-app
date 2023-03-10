import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { GoVerified } from 'react-icons/go';
import { MdOutlineCancel } from 'react-icons/md';
import { BsFillPlayFill } from 'react-icons/bs';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import axios from 'axios';
import { NextPage } from 'next';

import { BASE_URL } from '../../utils';
import { Video } from '../../types';
import useAuthStore from '../../store/authStore';
import LikeButton from '../../components/LikeButton';
import Comments from '../../components/Comments';
import VideoButton, { VIDEO_BUTTON_TYPE } from '../../components/VideoButton';

type PostDetails = {
  postDetails: Video;
};

const Detail: NextPage<PostDetails> = ({ postDetails }) => {
  const [post, setPost] = useState(postDetails);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [comment, setComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (post && videoRef.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [isVideoMuted, post]);

  const onVideoClick = () => {
    if (playing) {
      videoRef?.current?.pause();
      setPlaying(false);
    } else {
      videoRef?.current?.play();
      setPlaying(true);
    }
  };

  const handleLike = async (like: boolean) => {
    if (!userProfile) return;

    const { data } = await axios.put(`${BASE_URL}/api/like`, {
      userId: userProfile._id,
      postId: post._id,
      like,
    });

    setPost({ ...post, likes: data.likes });
  };

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userProfile || !comment) return;

    setIsPostingComment(true);
    const { data } = await axios.put(`${BASE_URL}/api/post/${post._id}`, {
      userId: userProfile._id,
      comment,
    });

    setPost({ ...post, comments: data.comments });
    setComment('');
    setIsPostingComment(false);
  };

  if (!post) return null;

  return (
    <div className='flex w-full absolute left-0 top-0 bg-white flex-wrap lg:flex-nowrap'>
      <div className='relative w-[1000px] lg:w-9/12 flex justify-center items-center bg-blurred-img bg-no-repeat bg-cover bg-center'>
        <div className='opacity-90 absolute top-6 left-2 lg:left-6 z-50'>
          <p className=' cursor-pointer' onClick={() => router.back()}>
            <MdOutlineCancel className='text-white text-[35px] hover:opacity-90' />
          </p>
        </div>
        <div
          className='relative'
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div className='lg:h-[100vh] h-[60vh]'>
            <video
              src={post.video.asset.url}
              ref={videoRef}
              loop
              onClick={onVideoClick}
              className=' h-full cursor-pointer'
            ></video>
          </div>
          <div className='absolute top-[45%] left-[40%] cursor-pointer'>
            {isHover && (
              <div className='flex justify-between w-full px-4 absolute bottom-3'>
                {playing ? (
                  <VideoButton
                    onButtonPress={onVideoClick}
                    buttonType={VIDEO_BUTTON_TYPE.pause}
                    size=' text-6xl lg:text-8xl'
                    opacity=' opacity-20'
                  />
                ) : (
                  <VideoButton
                    onButtonPress={onVideoClick}
                    buttonType={VIDEO_BUTTON_TYPE.play}
                    opacity=' opacity-20'
                    size=' text-6xl lg:text-8xl'
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className='absolute bottom-5 lg:bottom-10 right-5 lg:right-10 cursor-pointer'>
          {isVideoMuted ? (
            <VideoButton
              onButtonPress={() => setIsVideoMuted(false)}
              buttonType={VIDEO_BUTTON_TYPE.mute}
              size=' text-white text-3xl lg:text-4xl'
              opacity=' opacity-100'
            />
          ) : (
            <VideoButton
              onButtonPress={() => setIsVideoMuted(true)}
              buttonType={VIDEO_BUTTON_TYPE.unmute}
              size=' text-white text-3xl lg:text-4xl'
              opacity=' opacity-100'
            />
          )}
        </div>
      </div>

      <div className='flex flex-col w-full w-[1000px] md:w-[900px] lg:w-[700px] box-border'>
        <div className=' px-10 mb-1'>
          {/* avator and name of the poster */}
          <div className='flex gap-2 items-center lg:mt-20 mt-10'>
            <div className='md:w-16 md:h-16 w-10 h-10'>
              <Link href='#'>
                <>
                  <Image
                    width={62}
                    height={62}
                    src={post.postedBy.image}
                    alt='profile photo'
                    className=' rounded-full'
                  />
                </>
              </Link>
            </div>
            <div>
              <Link href='#' className=' flex flex-col gap-1'>
                <p className=' flex gap-2 items-center md:text-base font-bold text-primary'>
                  {post.postedBy.userName}
                  {` `}
                  <GoVerified className=' text-blue-400 text-base' />
                </p>
                <p className=' capitalize font-medium text-xs text-gray-500 hidden md:block'>
                  {post.postedBy.userName}
                </p>
              </Link>
            </div>
          </div>

          {/* post caption */}
          <div className=' mt-5'>
            <p className=' text-md text-gray-400'>{post.caption}</p>
          </div>

          {/* like button */}
          <div className='mt-10 ml-3'>
            {userProfile && (
              <LikeButton
                likes={post.likes}
                handleLike={() => handleLike(true)}
                handleDislike={() => handleLike(false)}
              />
            )}
          </div>
        </div>

        <Comments
          comment={comment}
          setComment={setComment}
          addComment={addComment}
          comments={post.comments}
          isPostingComment={isPostingComment}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async ({ params: { id } }: { params: { id: string } }) => {
  const { data } = await axios.get(`${BASE_URL}/api/post/${id}`);
  return {
    props: { postDetails: data },
  };
};

export default Detail;
