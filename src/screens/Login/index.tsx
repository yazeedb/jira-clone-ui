import React, { FC } from 'react';
import './Login.scss';
import { Sender } from 'xstate';
import { useGoogleSignIn } from './useGoogleSignIn';
import { LandingForm } from 'shared/components/LandingForm';

interface LoginProps {
  send: Sender<any>;
}

export const googleButtonId = 'google-signin-button';

export const Login: FC<LoginProps> = ({ send }) => {
  useGoogleSignIn(googleButtonId, send);

  return (
    <LandingForm containerClassName="login">
      <h5>Log in to your account</h5>

      <div id={googleButtonId}></div>

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
