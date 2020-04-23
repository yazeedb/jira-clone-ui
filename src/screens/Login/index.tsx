import React, { FC } from 'react';
import './Login.scss';
import { Sender } from 'xstate';
import { useGoogleSignIn } from './useGoogleSignIn';

interface LoginProps {
  send: Sender<any>;
}

export const googleButtonId = 'google-signin-button';

export const Login: FC<LoginProps> = ({ send }) => {
  useGoogleSignIn(googleButtonId, send);

  return (
    <main className="login">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <section>
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
        </section>

        <footer>
          <img src="Atlassian-horizontal-blue-rgb.svg" alt="Atlassian Logo" />

          <span className="subtext">
            One account for Jira, Confluence, Trello and{' '}
            <a
              href="https://confluence.atlassian.com/cloud/your-atlassian-account-976161169.html"
              target="_blank"
              rel="noreferrer noopener"
            >
              more
            </a>
            .
          </span>
        </footer>
      </div>
    </main>
  );
};
