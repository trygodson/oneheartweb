import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { earlyRoutes } from './utils/MainRoutes';
import 'react-circular-progressbar/dist/styles.css';
import { createContext, useState } from 'react';
import { GET_STORAGE_ITEM } from './config/storage';
import { RouteGuard } from './utils/RouteGuard';
import { AppRoutes } from './utils/AppRoutes';
import { AppLayoutNew } from './layout/AppLayoutNew';
import './App.css';
import './datepicker.css';
import { AuthProvider } from './context/authContext';
import { NotFound } from './layout/NotFound';
// import { NotificationProvider } from './context/notificationContext';
import PermissionedRoute from './utils/PermissionedRoute';
export const ToggleSidebarContext = createContext();

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <AuthProvider>
      {/* <NotificationProvider> */}
      <ToggleSidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        <BrowserRouter>
          <Routes>
            {earlyRoutes.map((route, idx) => (
              <Route key={idx} path={route.path} Component={route.component} />
            ))}

            <Route path="app" element={<RouteGuard />}>
              {/* <Route path="app" element={<AppLayoutNew />}> */}
              {AppRoutes &&
                AppRoutes.map((route, key) => {
                  return (
                    <Route
                      key={key}
                      path={`${route.path}`}
                      element={
                        <PermissionedRoute permissions={route.permissions}>
                          <route.component />
                        </PermissionedRoute>
                      }
                    />
                  );
                })}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToggleSidebarContext.Provider>
      {/* </NotificationProvider> */}
    </AuthProvider>
  );
}

export default App;
