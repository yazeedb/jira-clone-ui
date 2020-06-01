import React, { useState } from 'react';
import { projectsMachine } from 'machines/projectsMachine';
import { useMachine } from '@xstate/react';
import Button from '@atlaskit/button';
import ProgressBar from '@atlaskit/progress-bar';
import DynamicTable from '@atlaskit/dynamic-table';
import TextField from '@atlaskit/textfield';
import EditorSearchIcon from '@atlaskit/icon/glyph/editor/search';
import { SomethingWentWrong } from 'shared/components/SomethingWentWrong';
import { ImpossibleStateNotice } from 'shared/components/ImpossibleStateNotice';
import { CreateProject } from './CreateProject';
import { NoResultsSvg } from 'shared/components/NoResultsSvg';
import { ProjectCard } from 'shared/components/ProjectCard';
import './Projects.scss';
import { Link } from 'react-router-dom';
import { createBoardRoute } from 'shared/appRoutes';

export const Projects = () => {
  const [current, send] = useMachine(projectsMachine, {
    devTools: true
  });

  console.log('Projects current:', current);

  switch (true) {
    case current.matches('fetchingProjects'):
      return <ProgressBar isIndeterminate />;

    case current.matches('fetchFailed'):
      return <SomethingWentWrong />;

    case current.matches('viewingProjects'):
      return <ViewProjects />;

    default:
      console.error('Impossible state reached', current);
      return <ImpossibleStateNotice />;
  }

  function ViewProjects() {
    const { projects, createProjectService } = current.context;
    const [filter, setFilter] = useState('');

    console.log('ViewProjects current:', current);

    const renderContent = () => {
      if (projects.length === 0) {
        return (
          <section className="no-projects">
            <img src="empty-folder.svg" alt="Empty folder" />
            <h3>You currently have no projects</h3>
            <p>Let's create your first project in Jira</p>
            <Button onClick={() => send('CREATE_PROJECT')} appearance="primary">
              Create project
            </Button>
          </section>
        );
      }

      const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(filter.toLowerCase())
      );

      return (
        <>
          {/* 
          
          TODO: This is shown when LocalStorage has recently visited projects
          <div style={{ margin: '20px 0' }}>
            <p style={{ marginBottom: '5px' }}>Recents</p>
            <ProjectCard project={projects[0]} />
          </div> */}

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <TextField
              width="small"
              isCompact
              elemAfterInput={
                <div style={{ marginRight: '5px' }}>
                  <EditorSearchIcon label="Find project" />
                </div>
              }
              value={filter}
              onChange={(event) => {
                setFilter(event.currentTarget.value.trim());
              }}
            />
          </div>

          <DynamicTable
            head={{
              cells: [
                { content: 'Name', key: 'name' },
                { content: 'Key', key: 'key' },
                { content: 'Type', key: 'type' },
                { content: 'Lead', key: 'lead' }
              ]
            }}
            rows={filteredProjects.map((p) => {
              const leadFullName = `${p.lead.firstName} ${p.lead.lastName}`;

              return {
                cells: [
                  {
                    content: (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src="mockProjectAvatar.svg"
                          alt={p.name}
                          style={{
                            width: '24px',
                            borderRadius: '3px',
                            marginRight: '8px'
                          }}
                        />
                        <Link
                          to={createBoardRoute({
                            orgName: p.orgName,
                            projectKey: p.key
                          })}
                        >
                          {p.name}
                        </Link>
                      </span>
                    )
                  },
                  { content: p.key },
                  { content: p.type },
                  {
                    content: (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src="mockProfilePicture.png"
                          alt={leadFullName}
                          style={{
                            width: '24px',
                            borderRadius: '50%',
                            marginRight: '8px'
                          }}
                        />
                        <a href="#">{leadFullName}</a>
                      </span>
                    )
                  }
                ]
              };
            })}
            loadingSpinnerSize="large"
            defaultSortKey="name"
            defaultSortOrder="ASC"
          />

          {filteredProjects.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <NoResultsSvg />
              <h3>No projects were found that match your search</h3>
            </div>
          )}
        </>
      );
    };

    return (
      <section className="view-projects">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '24px'
          }}
        >
          <h2 className="title">Projects</h2>

          {projects.length > 0 && (
            <Button onClick={() => send('CREATE_PROJECT')} appearance="primary">
              Create project
            </Button>
          )}
        </div>

        {renderContent()}

        {current.matches('viewingProjects.creatingProject') && (
          <CreateProject
            isOpen={current.matches('viewingProjects.creatingProject')}
            createProjectService={createProjectService}
          />
        )}
      </section>
    );
  }
};
