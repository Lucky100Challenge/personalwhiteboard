import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Supporter {
  id: string;
  name: string;
  imageUrl: string;
}

interface SupporterCTAProps {
  supporters: Supporter[];
}

const SupporterCTA: React.FC<SupporterCTAProps> = ({ supporters }) => {
  return (
    <div className="supporter-cta">
      <div className="supporter-section">
        <div className="supporter-images">
          {supporters.map((supporter, index) => (
            <div key={supporter.id} className="supporter-image" style={{ zIndex: supporters.length - index }}>
              <Image
                src={supporter.imageUrl}
                alt={supporter.name}
                width={40}
                height={40}
                className="rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-placeholder.png'; // Fallback image
                }}
              />
            </div>
          ))}
        </div>
        <p className="supporter-count">{supporters.length} Supporters</p>
      </div>
      <div className="cta-text">
        <p>Want your pic here too?</p>
        <Link href="https://buymeacoffee.com/" className="support-button">
          Support the challenge
        </Link>
      </div>
    </div>
  );
};

export default SupporterCTA;