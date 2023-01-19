import { createApp } from "vue";
import App from "./App.vue";
import 'uno.css'

// Qusar相关
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(Quasar, {
  plugins: {},
})

app.mount("#app");
