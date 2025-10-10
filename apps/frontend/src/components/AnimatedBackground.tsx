import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'minimal' | 'particles';
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'default',
  children,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      });
    };

    // Générer des particules pour le variant particles
    if (variant === 'particles') {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
      }));
      setParticles(newParticles);
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [variant]);

  return (
    <div className={`animated-background animated-background--${variant}`}>
      {/* Fond dégradé de base */}
      <div className='background-gradient'></div>

      {/* Orbes flottants */}
      {variant !== 'minimal' && (
        <>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='gradient-orb orb-3'></div>
          <div className='gradient-orb orb-4'></div>
        </>
      )}

      {/* Suiveur de souris */}
      <div
        className='mouse-follower'
        style={{
          transform: `translate(${mousePosition.x}vw, ${mousePosition.y}vh)`,
        }}
      />

      {/* Particules flottantes pour le variant particles */}
      {variant === 'particles' && (
        <div className='particles-container'>
          {particles.map(particle => (
            <div
              key={particle.id}
              className='particle'
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.id * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Grille animée en arrière-plan */}
      {variant === 'default' && (
        <div className='animated-grid'>
          <div
            className='grid-line grid-line--vertical'
            style={{ left: '25%' }}
          ></div>
          <div
            className='grid-line grid-line--vertical'
            style={{ left: '50%' }}
          ></div>
          <div
            className='grid-line grid-line--vertical'
            style={{ left: '75%' }}
          ></div>
          <div
            className='grid-line grid-line--horizontal'
            style={{ top: '25%' }}
          ></div>
          <div
            className='grid-line grid-line--horizontal'
            style={{ top: '50%' }}
          ></div>
          <div
            className='grid-line grid-line--horizontal'
            style={{ top: '75%' }}
          ></div>
        </div>
      )}

      {/* Contenu */}
      {children && <div className='background-content'>{children}</div>}
    </div>
  );
};

export default AnimatedBackground;
