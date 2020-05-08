import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import { JiraSoftwareIcon } from '@atlaskit/logo';
import { Tooltip } from 'react-tippy';
import './GlobalNav.scss';

export const GlobalNav: FC = () => {
  return (
    <div className="global-nav">
      <div className="first-nav">
        <div className="jira-icon-wrapper">
          <Tooltip position="right" title="Jira Software">
            <JiraSoftwareIcon label="Jira Software" iconColor="inherit" />
          </Tooltip>
        </div>

        <div className="icon-wrapper">
          <Tooltip position="right" title="Help">
            <QuestionCircleIcon label="Help" secondaryColor="inherit" />
          </Tooltip>
        </div>

        <div className="icon-wrapper">
          <Tooltip position="right" title="TODO: Switch to">
            <QuestionCircleIcon
              label="TODO: Switch to"
              secondaryColor="inherit"
            />
          </Tooltip>
        </div>

        <div className="icon-wrapper">
          <Tooltip position="right" title="TODO: Your profile and settings">
            <QuestionCircleIcon
              label="TODO: Your profile and settings"
              secondaryColor="inherit"
            />
          </Tooltip>
        </div>
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
