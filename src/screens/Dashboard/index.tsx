import React from 'react';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import './Dashboard.scss';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  return (
    <main className="dashboard">
      <aside>
        <h1 className="title">Jira Software</h1>
        <ul>
          <li>
            <Link to="/">
              <FolderIcon label="Projects" />
              <span className="link-text">Projects</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <PeopleIcon label="People" />
              <span className="link-text">People</span>
            </Link>
          </li>
        </ul>
      </aside>
    </main>
  );
};
