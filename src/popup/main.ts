import { createApp } from 'vue';
import App from './Popup.vue';
import { setupApp } from '~/logic/common-setup';
import '../styles';
import 'vue3-snackbar/styles';

const app = createApp(App);
setupApp(app);
app.mount('#app');
