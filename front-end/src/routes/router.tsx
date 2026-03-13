import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { AppLayout } from '../components/layout';
import { AuthLayout } from '../components/layout/auth-layout';
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
} from '../pages';

const rootRoute = createRootRoute({
  component: () => {
    const pathname = window.location.pathname;
    const isAuthPage = pathname === '/login' || pathname === '/register';
    
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
  },
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
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
