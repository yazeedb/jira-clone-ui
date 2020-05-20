import React, { FC } from 'react';
import './Login.scss';
import { Sender } from 'xstate';
import { useGoogleSignIn } from './useGoogleSignIn';
import { LandingForm } from 'shared/components/LandingForm';
import Spinner from '@atlaskit/spinner';

interface LoginProps {
  send: Sender<any>;
  loading: boolean;
}

export const googleButtonId = 'google-signin-button';

export const Login: FC<LoginProps> = ({ send, loading }) => {
  useGoogleSignIn(googleButtonId, send, loading);

  return (
    <LandingForm containerClassName="login">
      {loading ? (
        <>
          <h4 className="heading">Authenticating...</h4>
          <Spinner />
        </>
      ) : (
        <>
          <h4 className="heading">Log in to your account</h4>

          <div id={googleButtonId}></div>
        </>
      )}

      <div className="links">
        <a
          href="https://www.atlassian.com/legal/privacy-policy"
          target="_blank"
          rel="noreferrer noopener"
        >
          Privacy policy
        </a>

        <a
          href="https://www.atlassian.com/legal/cloud-terms-of-service"
          target="_blank"
          rel="noreferrer noopener"
        >
          Terms of use
        </a>
      </div>
    </LandingForm>
  );
};
