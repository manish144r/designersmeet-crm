import React from 'react';
import { useList, useUpdate } from 'some-library';
import { Card, CardHeader, CardContent, Badge, ActivityRow, DeliverableCard, VendorRow } from 'components';
import { Tabs, TabsTrigger, TabsContent } from 'tabs-component';

const ProjectDetail = ({ pid }) => {
  const { data: stages } = useList('project-stages');
  const updateStage = useUpdate('project-stages');
  const { data: tasks } = useList('tasks', { projectId: pid });
  const { data: deliverables } = useList('deliverables', { projectId: pid });
  const { data: vendors } = useList('vendors', { projectId: pid });
  const { data: activities } = useList('activities', { projectId: pid });

  const stageRows = stages.map(stage => (
    <StageRow
      key={stage.id}
      stage={stage}
      onToggle={s => updateStage.mutate({ id: s.id, patch: { completed: !(s.completed === true) } })}
    />
  ));

  return (
    <main>
      <Tabs defaultValue='overview'>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='tasks'>Tasks</TabsTrigger>
        <TabsTrigger value='deliverables'>Deliverables</TabsTrigger>
        <TabsTrigger value='vendors'>Vendors</TabsTrigger>
        <TabsTrigger value='files'>Files</TabsTrigger>
        <TabsTrigger value='activity'>Activity</TabsTrigger>

        <TabsContent value='overview'>
          <div className="grid grid-cols-3 gap-4">
            {/* Existing content for overview */}
          </div>
        </TabsContent>

        <TabsContent value='tasks'>
          <Card>
            <CardHeader>Tasks</CardHeader>
            <CardContent>
              {stageRows.length > 0 ? stageRows : tasks.map(task => <TaskRow key={task.title} task={task} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='deliverables'>
          <Card>
            <CardHeader>Deliverables</CardHeader>
            <CardContent>
              {/* Status filter row */}
              <div className="flex space-x-4">
                <button>All</button>
                <button>In review</button>
                <button>Approved</button>
                <button>Pending</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {deliverables.map(deliverable => (
                  <DeliverableCard key={deliverable.id} deliverable={deliverable} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vendors'>
          <Card>
            <CardHeader>Vendors</CardHeader>
            <CardContent>
              {vendors.map(vendor => (
                <VendorRow key={vendor.id} vendor={vendor} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='files'>
          <Card>
            <CardHeader>Files</CardHeader>
            <CardContent>
              {/* Phase-2 placeholder */}
              <div>Files content coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity'>
          <Card>
            <CardHeader>Activity</CardHeader>
            <CardContent>
              {activities.map(activity => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

const StageRow = ({ stage, onToggle }) => (
  <div className="flex items-center border-b border-border-subtle">
    <button
      className={`checkbox ${stage.completed ? 'border-info bg-info-tint' : ''}`}
      onClick={() => onToggle(stage)}
    >
      {stage.completed && <span className="dot bg-info size-1.5 rounded-sm"></span>}
    </button>
    <div className="flex-1">{stage.title}</div>
    <Badge>{stage.badge}</Badge>
    <div>{stage.due}</div>
    <div>{stage.owner}</div>
  </div>
);

export default ProjectDetail;
