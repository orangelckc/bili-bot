import { createApp } from "vue";
import App from "./App.vue";
import 'uno.css'

// Qusar相关
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(Quasar, {
  plugins: { Notify },
  config: {
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white'
    }
  }
})

app.mount("#app");
