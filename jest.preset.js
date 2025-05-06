const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  forceExit: true,
  detectOpenHandles: true,
};
