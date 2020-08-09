import { useEffect } from 'react';
import { fetcher } from '../../fetcher';
import { apiRoutes } from 'shared/apiRoutes';

const googleClientId =
  '235318923218-s6tms65fam3o6d51shlhmci587s5mi22.apps.googleusercontent.com';
const googleApiSrc = 'https://apis.google.com/js/platform.js';

export const useGoogleSignIn = (
  elementId: string,
  onSuccess: (idToken: string) => void,
  onFailure: (errorMessage: string) => void
) => {
  useEffect(() => {
    const meta = document.createElement('meta');

    meta.name = 'google-signin-client_id';
    meta.content = googleClientId;

    document.head.appendChild(meta);

    const script = document.createElement('script');

    script.src = googleApiSrc;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      gapi.signin2.render(elementId, {
        scope: 'profile email',
        width: 320,
        height: 50,
        longtitle: true,
        theme: 'dark',

        onfailure: ({ error }: any) =>
          onFailure('Error encountered while signing in with Google'),

        onsuccess: (googleUser: any) => {
          const { id_token } = googleUser.getAuthResponse();

          // Prevent automatic Google sign-in loop if request fails
          gapi.auth2.getAuthInstance().disconnect();

          onSuccess(id_token);
        }
      });
    };

    document.body.appendChild(script);
  }, [elementId, onSuccess, onFailure]);
};

declare const gapi: any;
