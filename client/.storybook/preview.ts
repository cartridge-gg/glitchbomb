import type { Decorator, Preview } from "@storybook/react-vite";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import "../src/index.css";
import "./preview.css";
import { ThemeProvider } from "../src/contexts/theme";

const withThemeProvider: Decorator = (Story) =>
  createElement(
    MemoryRouter,
    null,
    createElement(ThemeProvider, null, createElement(Story)),
  );

const preview: Preview = {
  decorators: [withThemeProvider],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: {
          name: "dark",
          value: "#000000",
        },

        light: {
          name: "light",
          value: "#ffffff",
        },
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "dark",
    },
  },
};

export default preview;
