'use client';

import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          await axios.post('/api/auth/', {
            credential: credentialResponse.credential,
          });
          window.location.href = '/Home';
        }}
        onError={() => console.log('Login Failed')}
      />
    </div>
  );
}
