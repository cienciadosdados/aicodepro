import React, { useState, useEffect, useRef } from 'react';

interface OptimizedVideoProps {
  src: string;
  mobileSrc?: string;
  poster: string;
  mobilePoster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}

export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  mobileSrc,
  poster,
  mobilePoster,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  preload = 'metadata',
  width,
  height,
  priority = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [videoSrc, setVideoSrc] = useState(src);
  const [videoPoster, setVideoPoster] = useState(poster);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Detectar dispositivo móvel
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    // Detectar conexão lenta
    const checkConnection = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        const isLow = conn.saveData || 
                     conn.effectiveType === 'slow-2g' || 
                     conn.effectiveType === '2g' || 
                     conn.effectiveType === '3g';
        setIsLowBandwidth(isLow);
      }
    };

    checkMobile();
    checkConnection();

    // Adicionar event listeners
    window.addEventListener('resize', checkMobile);
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', checkConnection);
    }

    // Determinar qual fonte de vídeo usar
    if (isMobile && mobileSrc) {
      setVideoSrc(mobileSrc);
    } else {
      setVideoSrc(src);
    }

    // Determinar qual poster usar
    if (isMobile && mobilePoster) {
      setVideoPoster(mobilePoster);
    } else {
      setVideoPoster(poster);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', checkConnection);
      }
    };
  }, [isMobile, isLowBandwidth, src, mobileSrc, poster, mobilePoster]);

  useEffect(() => {
    // Usar IntersectionObserver para carregar o vídeo apenas quando visível
    if (!priority && videoRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsIntersecting(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );

      observer.observe(videoRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      setIsIntersecting(true);
    }
  }, [priority]);

  // Carregar o vídeo quando estiver visível
  useEffect(() => {
    if (isIntersecting && videoRef.current && !isLoaded) {
      if (autoPlay && !isLowBandwidth) {
        videoRef.current.load();
        videoRef.current.play().catch(error => {
          console.warn('Falha ao reproduzir vídeo automaticamente:', error);
        });
      }
      setIsLoaded(true);
    }
  }, [isIntersecting, autoPlay, isLowBandwidth, isLoaded]);

  // Em conexões lentas, não carregar o vídeo automaticamente
  const shouldAutoPlay = autoPlay && !isLowBandwidth;
  const shouldPreload = isLowBandwidth ? 'none' : preload;

  return (
    <video
      ref={videoRef}
      className={className}
      poster={videoPoster}
      autoPlay={shouldAutoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      preload={shouldPreload}
      playsInline
      width={width}
      height={height}
      style={{ maxWidth: '100%' }}
    >
      {(isIntersecting || priority) && (
        <source src={videoSrc} type="video/mp4" />
      )}
      Seu navegador não suporta a reprodução de vídeos.
    </video>
  );
};

export default OptimizedVideo;
