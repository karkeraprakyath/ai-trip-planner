import { SignIn } from '@clerk/nextjs'
import { div } from 'motion/react-client'

export default function Page() {
  return( 
    <div className='flex justify-center items-center h-screen w-full'>
    <SignIn />
    </div>
 )
}