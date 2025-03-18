"use client";

import YouTube from "react-youtube";

interface YTPlayerProps {
  videoUrl: string | null;
  title?: string;
  autoplay?: boolean;
}

const getYoutubeVideoId = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const YTPlayer = ({ 
  videoUrl,
  title,
  autoplay = false
}: YTPlayerProps) => {
  const videoId = videoUrl ? getYoutubeVideoId(videoUrl) : null;

  if (!videoId) {
    return (
      <div className="relative aspect-video flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">No video available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium">
          {title}
        </h3>
      )}
      <div className="aspect-video relative">
        <YouTube
          videoId={videoId}
          className="w-full h-full"
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              modestbranding: 1,
              rel: 0,
            },
          }}
        />
      </div>
    </div>
  );
};