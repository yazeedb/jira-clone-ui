import React, { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { Tooltip } from 'react-tippy';
import './GlobalNav.scss';

export const GlobalNav: FC = () => {
  const [secondNavOpen, setSecondNavOpen] = useState(true);

  return (
    <div className="global-nav">
      <div className={secondNavOpen ? 'second-nav open' : 'second-nav closed'}>
        <h2 className="title">Jira Software</h2>
        <ul>
          <li>
            <NavLink to="/projects">
              <FolderIcon label="Projects" />
              <span className="link-text">Projects</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/people">
              <PeopleIcon label="People" />
              <span className="link-text">People</span>
            </NavLink>
          </li>
        </ul>

        <button
          className="toggle-second-nav"
          onClick={() => setSecondNavOpen((v) => !v)}
        >
          {secondNavOpen ? (
            <Tooltip position="right" title="Collapse">
              <ChevronLeftIcon label="Collapse" secondaryColor="inherit" />
            </Tooltip>
          ) : (
            <Tooltip position="right" title="Expand">
              <ChevronRightIcon label="Expand" secondaryColor="inherit" />
            </Tooltip>
          )}
        </button>
      </div>
    </div>
  );
};
