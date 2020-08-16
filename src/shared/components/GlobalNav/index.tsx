import React, { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import AppSwitcherIcon from '@atlaskit/icon/glyph/app-switcher';
import StarLargeIcon from '@atlaskit/icon/glyph/star-large';
import SearchIcon from '@atlaskit/icon/glyph/search';
import AddIcon from '@atlaskit/icon/glyph/add';
import NotificationIcon from '@atlaskit/icon/glyph/notification';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { JiraSoftwareIcon } from '@atlaskit/logo';
import { Tooltip } from 'react-tippy';
import './GlobalNav.scss';

const mockProfilePicture =
  'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5ac56eefa05a8d1c98846c61/fe6f2859-d1ac-4e9e-a982-29214fd34c37/128?size=48&s=48';

const notAvailableYet = 'Not available yet';

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
