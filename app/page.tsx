'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Whiteboard = dynamic(() => import('../src/components/Whiteboard'), { ssr: false });

const Page: React.FC = () => {
  return <Whiteboard />;
};

export default Page;
