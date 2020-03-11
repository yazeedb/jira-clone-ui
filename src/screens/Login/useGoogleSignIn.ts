import { useEffect, useContext } from 'react';
import { fetcher } from '../../fetcher';
import { AuthContext } from '../../App';

declare const gapi: any;

export const useGoogleSignIn = (elementId: string) => {
  const userContext = useContext(AuthContext);

  useEffect(() => {
    const meta = document.createElement('meta');

    meta.name = 'google-signin-client_id';
    meta.content =
      '235318923218-s6tms65fam3o6d51shlhmci587s5mi22.apps.googleusercontent.com';

    document.head.appendChild(meta);

    const script = document.createElement('script');

    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      gapi.signin2.render(elementId, {
        scope: 'profile email',
        width: 320,
        height: 50,
        longtitle: true,
        theme: 'dark',
        onsuccess: async (googleUser: any) => {
          const { id_token } = googleUser.getAuthResponse();

          await fetcher('/csrf-protection');

          const response = await fetcher.post('/signupViaGoogle', {
            idToken: id_token
          });

          fetcher
            .post('/login', { idToken: response.data.userId })
            .then((response) => {
              userContext.setAuth(true);
            });
        },
        onfailure: () => {
          userContext.setAuth(false);
        }
      });
    };

    document.body.appendChild(script);
  }, [elementId]);
};
