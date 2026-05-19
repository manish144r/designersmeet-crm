import type { Preview } from "@storybook/react-vite";
import "../src/index.css"; // design tokens + locked primitives

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true }, // brand is all-white; never override
  },
};

export default preview;
