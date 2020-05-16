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

export const GlobalNav: FC = () => {
  const [secondNavOpen, setSecondNavOpen] = useState(true);

  return (
    <div className="global-nav">
      <div className="first-nav">
        <div className="icon-row">
          <div className="icon-wrapper jira-logo-wrapper">
            <Tooltip position="right" title="Jira Software">
              <JiraSoftwareIcon label="Jira Software" iconColor="inherit" />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Starred and recent">
              <StarLargeIcon
                label="Starred and recent"
                secondaryColor="inherit"
              />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Search">
              <SearchIcon label="Search" secondaryColor="inherit" />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Create">
              <AddIcon label="Create" secondaryColor="inherit" />
            </Tooltip>
          </div>
        </div>

        <div className="icon-row">
          <div className="icon-wrapper">
            <Tooltip position="right" title="Notifications">
              <NotificationIcon
                label="Notifications"
                secondaryColor="inherit"
              />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Switch to">
              <AppSwitcherIcon label="Switch to" secondaryColor="inherit" />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Help">
              <QuestionCircleIcon label="Help" secondaryColor="inherit" />
            </Tooltip>
          </div>

          <div className="icon-wrapper">
            <Tooltip position="right" title="Your profile and settings">
              <img
                src={mockProfilePicture}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%'
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>

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
