import { useEffect, useContext } from 'react';
import { fetcher } from '../../fetcher';
import { AuthContext } from '../../App';

const googleClientId =
  '235318923218-s6tms65fam3o6d51shlhmci587s5mi22.apps.googleusercontent.com';
const googleApiSrc = 'https://apis.google.com/js/platform.js';

export const useGoogleSignIn = (elementId: string) => {
  const { send } = useContext(AuthContext);

  useEffect(() => {
    const metaQuery = `meta[content="${googleClientId}"]`;
    const scriptQuery = `script[src="${googleApiSrc}"]`;

    const meta =
      (document.querySelector(metaQuery) as HTMLMetaElement) ||
      document.createElement('meta');

    meta.name = 'google-signin-client_id';
    meta.content = googleClientId;

    document.head.appendChild(meta);

    const script =
      (document.querySelector(scriptQuery) as HTMLScriptElement) ||
      document.createElement('script');

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

          const response = await fetcher.post('/login', {
            idToken: id_token
          });

          send({
            type: 'RETRY'
          });
        },
        onfailure: () => {
          send('FAILED');
        }
      });
    };

    document.body.appendChild(script);
  }, [elementId, send]);
};

declare const gapi: any;
