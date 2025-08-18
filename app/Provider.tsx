'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Header from './_components/Header';
import Footer from './_components/Footer';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const createUser = useMutation(api.user.CreateNewUser);
  const [userDetail, setUserDetail] = useState<any>();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      createNewUser();
    }
  }, [user]);

  const createNewUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress ?? '',
      imageUrl: user?.imageUrl,
      name: user?.fullName ?? '',
    });
    setUserDetail(result);
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div className='min-h-dvh flex flex-col'>
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
      </div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
export const useUserDetail=()=>{
  return useContext(UserDetailContext);
}