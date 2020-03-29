import React, { FC } from 'react';
import { User } from '../../App';
import './CompleteSignup.scss';

interface CompleteSignupProps {
  user: User;
}

export const CompleteSignup: FC<CompleteSignupProps> = ({ user }) => {
  return (
    <main className="complete-signup">
      <div className="container">
        <header>
          <img src="jira-logo.svg" alt="Jira Logo" className="jira-logo" />
        </header>

        <section>
          <h5>Complete your profile</h5>

          <form>
            <input type="email" placeholder={user.email} disabled />
            <input type="text" placeholder="First name" />
            <input type="text" placeholder="Last name" />

            <input type="text" placeholder="Job title (optional)" />
            <input type="text" placeholder="Department (optional)" />
            <input type="text" placeholder="Organization (optional)" />
            <input type="text" placeholder="Location (optional)" />

            <button type="submit">Complete profile</button>
          </form>
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
