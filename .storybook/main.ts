import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: ["../storybook-stories/**/*.stories.ts"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
};
export default config;
