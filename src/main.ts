import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./routes/routers.ts";
import './index.css'  // or tailwind.css
const app = createApp(App);

const pinia = createPinia();
app.use(pinia);        // ✅ Pinia first
app.use(router);       // ✅ Router after Pinia

router.isReady().then(() => {
    app.mount("#app");
});
