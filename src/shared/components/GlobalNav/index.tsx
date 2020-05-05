import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import { JiraSoftwareIcon } from '@atlaskit/logo';
import './GlobalNav.scss';

export const GlobalNav: FC = () => {
  return (
    <div className="global-nav">
      <div className="first-nav">
        <JiraSoftwareIcon />
      </div>

      <div className="second-nav">
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
      </div>
    </div>
  );
};
