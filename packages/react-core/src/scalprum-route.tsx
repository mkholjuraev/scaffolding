import { getApp, getAppsByRootLocation, injectScript } from '@scalprum/core';
import React, { Fragment, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';

export interface ScalprumRouteProps<T = Record<string, unknown>> extends RouteProps {
  Placeholder?: React.ComponentType;
  appName: string;
  elementId: string;
  path: string;
  api?: T;
}
export const ScalprumRoute: React.ComponentType<ScalprumRouteProps> = ({ Placeholder = Fragment, elementId, appName, path, api, ...props }) => {
  const { scriptLocation } = getAppsByRootLocation(path as string)?.[0];
  useEffect(() => {
    const app = getApp(appName);

    if (!app) {
      injectScript(appName, scriptLocation).then(() => {
        const app = getApp(appName);
        app.mount(api);
      });
    } else {
      app.mount(api);
    }
  }, [path]);

  return (
    <Route {...props} path={path}>
      <div id={elementId}>
        <Placeholder />
      </div>
    </Route>
  );
};
