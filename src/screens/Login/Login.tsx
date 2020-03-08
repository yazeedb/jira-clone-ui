import React from 'react';
import './Login.scss';

export const Login: React.FC = (props) => {
  return (
    <main className="login">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <footer>
          <img src="Atlassian-horizontal-blue-rgb.svg" alt="Atlassian Logo" />

          <span>
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
