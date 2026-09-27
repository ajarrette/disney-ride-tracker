const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

module.exports = (config) => {
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const projectName = config.modRequest.projectName;
    const target = Object.values(project.pbxNativeTargetSection()).find(
      (item) => item.name === projectName,
    );

    if (!target) {
      throw new Error(`Could not find the ${projectName} Xcode target.`);
    }

    const configurationList =
      project.pbxXCConfigurationList()[target.buildConfigurationList];
    const buildConfigurations = project.pbxXCBuildConfigurationSection();
    const teamId = config.ios?.appleTeamId;
    const category = config.ios?.infoPlist?.LSApplicationCategoryType;

    for (const reference of configurationList.buildConfigurations) {
      const configurationId =
        typeof reference === 'string' ? reference : reference.value;
      const buildSettings = buildConfigurations[configurationId]?.buildSettings;

      if (!buildSettings) continue;

      if (teamId) {
        buildSettings.DEVELOPMENT_TEAM = teamId;
        buildSettings.CODE_SIGN_STYLE = 'Automatic';
      }

      if (category) {
        buildSettings.INFOPLIST_KEY_LSApplicationCategoryType = category;
      }
    }

    return config;
  });

  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName;
      const schemeDirectory = path.join(
        config.modRequest.platformProjectRoot,
        `${projectName}.xcodeproj`,
        'xcshareddata',
        'xcschemes',
      );
      const generatedSchemePath = path.join(
        schemeDirectory,
        `${projectName}.xcscheme`,
      );
      const sharedSchemePath = path.join(
        schemeDirectory,
        'DisneyRideTracker.xcscheme',
      );

      if (!fs.existsSync(generatedSchemePath)) {
        throw new Error(
          `Could not find the generated ${projectName} Xcode scheme.`,
        );
      }

      const scheme = fs.readFileSync(generatedSchemePath, 'utf8');
      const runActionPattern =
        /(<LaunchAction\b[\s\S]*?\bbuildConfiguration\s*=\s*")[^"]*(")/;

      if (!runActionPattern.test(scheme)) {
        throw new Error('Could not find the Xcode scheme Run configuration.');
      }

      const updatedScheme = scheme.replace(runActionPattern, '$1Release$2');
      fs.writeFileSync(sharedSchemePath, updatedScheme);

      if (generatedSchemePath !== sharedSchemePath) {
        fs.unlinkSync(generatedSchemePath);
      }

      return config;
    },
  ]);
};
