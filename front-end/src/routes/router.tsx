import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { AppLayout } from '../components/layout';
import { AuthLayout } from '../components/layout/auth-layout';
import { useAuth } from '../context/AuthProvider';
import React, { useEffect } from 'react';
import {
  DashboardPage,
  AIAssistantPage,
  ConceptionPage,
  NewProcessPage,
  TaskKanbanPage,
  TaskListPage,
  CalendarPage,
  ChatPage,
  SupportTicketPage,
  ProfilePage,
  SettingsPage,
  LoginPage,
  RegisterPage,
  ConfigurationPage,
  GroupManagementPage,
  HistoryPage,
  BpmnDeploymentPage,
  AdvancedAnalyticsPage,
  OfficePage,
  ProcessStarterPage,
  WorkflowsPage,
  ProcessMonitorPage,
  EventLogPage,
  SimulationPage,
  UsersPage,
} from '../pages';

function RootComponent() {
  const pathname = window.location.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const { isAuthenticated } = useAuth() as any;

  // AuthProvider retourne null pendant le chargement, donc isAuthenticated
  // est déjà la valeur finale au moment où ce composant se rend.
  useEffect(() => {
    if (!isAuthPage && !isAuthenticated) {
      window.location.replace('/login');
    }
  }, [isAuthenticated, isAuthPage]);

  if (isAuthPage) {
    return (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    );
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const aiAssistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-assistant',
  component: AIAssistantPage,
});

const conceptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conception',
  component: ConceptionPage,
});

const newProcessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/conception/nouveau',
  component: NewProcessPage,
});

const taskKanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/task/kanban',
  component: TaskKanbanPage,
});

const taskListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/task/list',
  component: TaskListPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatPage,
});

const supportTicketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support-ticket',
  component: SupportTicketPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});

const configurationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/configuration',
  component: ConfigurationPage,
});

const groupManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users-groups',
  component: GroupManagementPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const bpmnDeploymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bpmn-deployment',
  component: BpmnDeploymentPage,
});

const advancedAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/advanced-analytics',
  component: AdvancedAnalyticsPage,
});

const officeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/office',
  component: OfficePage,
});

const processStarterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/process-starter',
  component: ProcessStarterPage,
});

const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workflows',
  component: WorkflowsPage,
});

const processMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/process-monitor',
  component: ProcessMonitorPage,
});

const eventLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/event-logs',
  component: EventLogPage,
});

const simulationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/simulation',
  component: SimulationPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aiAssistantRoute,
  conceptionRoute,
  newProcessRoute,
  taskKanbanRoute,
  taskListRoute,
  calendarRoute,
  chatRoute,
  supportTicketRoute,
  profileRoute,
  settingsRoute,
  loginRoute,
  registerRoute,
  configurationRoute,
  groupManagementRoute,
  historyRoute,
  bpmnDeploymentRoute,
  advancedAnalyticsRoute,
  officeRoute,
  processStarterRoute,
  workflowsRoute,
  processMonitorRoute,
  eventLogRoute,
  simulationRoute,
  usersRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
