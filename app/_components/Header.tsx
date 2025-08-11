'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignInButton, useUser } from '@clerk/nextjs';

const menuOptions = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact us', path: '/contact-us' },
];

function Header() {
  const { user } = useUser(); // ✅ Proper user check

  return (
    <div className='flex justify-between items-center p-4'>
      {/* Logo + Title */}
      <div className="flex gap-2 items-center">
        <Image src="/Logo.svg" alt="logo image" width={30} height={30} />
        <h2 className="font-bold text-2xl">AI Trip Planner</h2>
      </div>

      {/* Menu Options */}
      <div className="flex gap-8 items-center">
        {menuOptions.map((menu, index) => (
          <Link href={menu.path} key={index}>
            <h2 className="text-lg hover:scale-105 transition-all hover:text-primary">
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>

      {/* Auth Button */}
      <div>
        {!user ? (
          <SignInButton mode='modal'>
            <Button>Get Started</Button>
          </SignInButton>
        ) : (
          <Link href="/create-new-trip">
            <Button>Create New Trip</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
