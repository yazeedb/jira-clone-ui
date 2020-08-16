import React, { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { Tooltip } from 'react-tippy';
import './GlobalNav.scss';

export const GlobalNav: FC = () => {
  const [navOpen, setNavOpen] = useState(true);

  return (
    <div className={navOpen ? 'global-nav open' : 'global-nav closed'}>
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
        className="toggle-global-nav"
        onClick={() => setNavOpen((v) => !v)}
      >
        {navOpen ? (
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
  );
};
