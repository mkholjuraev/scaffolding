import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ScalprumRoute } from './scalprum-route';
import { render, cleanup, getByText, act } from '@testing-library/react';
import * as ScalprumCore from '@scalprum/core';
import * as Inject from '@scalprum/core/dist/cjs/inject-script';
import { AppsConfig, GLOBAL_NAMESPACE } from '@scalprum/core';

describe('<ScalprumRoute />', () => {
  const mockInitScalprumConfig: AppsConfig = {
    appOne: {
      name: 'appOne',
      appId: 'appOne',
      rootLocation: '/foo',
      scriptLocation: '/bar.js',
      elementId: 'id',
    },
  };
  const getAppsByRootLocationSpy = jest.spyOn(ScalprumCore, 'getAppsByRootLocation').mockReturnValue([mockInitScalprumConfig.appOne]);
  const injectScriptSpy = jest.spyOn(Inject, 'injectScript');

  afterEach(() => {
    cleanup();
    window[GLOBAL_NAMESPACE] = undefined;
    getAppsByRootLocationSpy.mockClear();
    injectScriptSpy.mockClear();
  });

  test('should retrieve script location', () => {
    ScalprumCore.initialize({ scalpLets: mockInitScalprumConfig });
    render(
      <MemoryRouter>
        <ScalprumRoute appName="appOne" elementId="id" path="/foo" />
      </MemoryRouter>
    );

    expect(getAppsByRootLocationSpy).toHaveBeenCalledWith('/foo');
  });

  test('should inject script and mount app if it was not initialized before', async () => {
    const mount = jest.fn();
    ScalprumCore.initialize({ scalpLets: mockInitScalprumConfig });
    injectScriptSpy.mockImplementationOnce(() => {
      ScalprumCore.initializeApp({ name: 'appOne', mount, unmount: jest.fn(), update: jest.fn(), id: 'appOne' });
      return Promise.resolve();
    });
    await act(async () => {
      render(
        <MemoryRouter>
          <ScalprumRoute appName="appOne" elementId="id" path="/foo" />
        </MemoryRouter>
      );
    });

    expect(mount).toHaveBeenCalled();
    expect(injectScriptSpy).toHaveBeenCalledWith('appOne', '/bar.js');
  });

  test('should not inject script the app was initialized before', async () => {
    const mount = jest.fn();
    ScalprumCore.initialize({ scalpLets: mockInitScalprumConfig });
    ScalprumCore.initializeApp({ name: 'appOne', mount, unmount: jest.fn(), update: jest.fn(), id: 'appOne' });
    await act(async () => {
      render(
        <MemoryRouter>
          <ScalprumRoute appName="appOne" elementId="id" path="/foo" />
        </MemoryRouter>
      );
    });

    expect(mount).toHaveBeenCalled();
    expect(injectScriptSpy).not.toHaveBeenCalled();
  });
});
