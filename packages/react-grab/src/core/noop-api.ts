import type { ReactGrabAPI, ReactGrabState } from "../types.js";

export const createNoopApi = (): ReactGrabAPI => {
  const getState = (): ReactGrabState => ({
    isActive: false,
    isDragging: false,
    isCopying: false,
    isCrosshairVisible: false,
    isSelectionBoxVisible: false,
    isDragBoxVisible: false,
    targetElement: null,
    dragBounds: null,
    grabbedBoxes: [],
    labelInstances: [],
    selectionFilePath: null,
    toolbarState: null,
  });

  return {
    activate: () => {},
    deactivate: () => {},
    toggle: () => {},
    comment: () => {},
    isActive: () => false,
    isEnabled: () => false,
    setEnabled: () => {},
    getToolbarState: () => null,
    setToolbarState: () => {},
    onToolbarStateChange: () => () => {},
    dispose: () => {},
    copyElement: () => Promise.resolve(false),
    getSource: () => Promise.resolve(null),
    getStackContext: () => Promise.resolve([]),
    getState,
    setOptions: () => {},
    registerPlugin: () => {},
    unregisterPlugin: () => {},
    getPlugins: () => [],
    getDisplayName: () => null,
  };
};
