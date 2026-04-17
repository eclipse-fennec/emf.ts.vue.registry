import { createApp } from 'vue';
import DemoShell from './DemoShell.vue';
import { EmftsRendererPlugin } from '../../src/plugin/EmftsRendererPlugin';

const app = createApp(DemoShell);

// Plugin needed for the Circle Editor demo
app.use(EmftsRendererPlugin, { registerDefaults: true });

app.mount('#app');
