import React, { FC } from 'react';
import './LandingForm.scss';

interface LandingFormProps {
  containerClassName: string;
}

export const LandingForm: FC<LandingFormProps> = ({
  children,
  containerClassName
}) => {
  return (
    <main className="landing-form">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <section className={`landing-form-section ${containerClassName}`}>
          {children}
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
