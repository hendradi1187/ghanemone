/**
 * CodeBlock.stories — code snippet dengan language label + copy button.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta = {
  title: 'Data Display/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  argTypes: {
    language: {
      control: 'select',
      options: ['bash', 'javascript', 'python', 'typescript', 'sql', 'json', 'plain'],
    },
  },
  args: {
    code: 'echo "Hello, Ghanem.one"',
    language: 'bash',
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bash: Story = {
  args: {
    language: 'bash',
    code: `curl -X GET 'https://api.ghanem.one/v1/datasets/wk-onwj' \\
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \\
  -H 'Accept: application/json'`,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <CodeBlock {...args} />
    </div>
  ),
};

export const JavaScript: Story = {
  args: {
    language: 'javascript',
    filename: 'fetch-dataset.js',
    code: `const res = await fetch('https://api.ghanem.one/v1/datasets/wk-onwj', {
  headers: {
    Authorization: 'Bearer <YOUR_API_TOKEN>',
    Accept: 'application/json',
  },
});
const dataset = await res.json();
console.log(dataset);`,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <CodeBlock {...args} />
    </div>
  ),
};

export const Python: Story = {
  args: {
    language: 'python',
    filename: 'fetch_dataset.py',
    code: `import requests

response = requests.get(
    "https://api.ghanem.one/v1/datasets/wk-onwj",
    headers={
        "Authorization": "Bearer <YOUR_API_TOKEN>",
        "Accept": "application/json",
    },
)
dataset = response.json()
print(dataset)`,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <CodeBlock {...args} />
    </div>
  ),
};

export const WithCopy: Story = {
  args: {
    language: 'json',
    filename: 'response.json',
    code: `{
  "id": "wk-onwj",
  "title": "Working Area (WK) Boundary — ONWJ",
  "kind": "LAYER",
  "verified": true
}`,
  },
  render: (args) => (
    <div className="max-w-md">
      <CodeBlock {...args} />
    </div>
  ),
};

export const LongCode: Story = {
  args: {
    language: 'javascript',
    code: Array.from({ length: 40 }, (_, i) => `const line${i + 1} = 'panjang baris yang sangat-sangat panjang sehingga butuh horizontal scroll #' + ${i + 1};`).join('\n'),
  },
  render: (args) => (
    <div className="max-w-xl">
      <CodeBlock {...args} />
    </div>
  ),
};

export const HiddenCopy: Story = {
  args: {
    language: 'plain',
    code: 'Plain text tanpa tombol copy.',
    hideCopy: true,
  },
  render: (args) => (
    <div className="max-w-xl">
      <CodeBlock {...args} />
    </div>
  ),
};
