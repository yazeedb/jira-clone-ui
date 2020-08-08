import React, { FC } from 'react';
import './Login.scss';
import { useGoogleSignIn } from './useGoogleSignIn';
import { LandingForm } from 'shared/components/LandingForm';
import Spinner from '@atlaskit/spinner';

interface LoginProps {
  loading: boolean;
  onSuccess: () => void;
  onFailure: (errorMessage: string) => void;
}

export const googleButtonId = 'google-signin-button';

export const Login: FC<LoginProps> = ({ loading, onSuccess, onFailure }) => {
  useGoogleSignIn(googleButtonId, onSuccess, onFailure);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <h4 className="heading">Authenticating...</h4>
          <Spinner size="large" />
        </>
      );
    }

    return (
      <>
        <h4 className="heading">Log in to your account</h4>

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
      </>
    );
  };

  return (
    <LandingForm containerClassName="login">{renderContent()}</LandingForm>
  );
};
