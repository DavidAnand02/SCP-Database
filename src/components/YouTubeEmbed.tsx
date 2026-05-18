import React from 'react';

interface YouTubeEmbedProps {
  url: string;
}

export const YouTubeEmbed = ({ url }: YouTubeEmbedProps) => {
  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeID(url);

  if (!videoId) return null;

  return (
    <div className="aspect-video w-full bg-black rounded overflow-hidden border border-white/10 shadow-2xl">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="opacity-90 hover:opacity-100 transition-opacity"
      ></iframe>
    </div>
  );
};
