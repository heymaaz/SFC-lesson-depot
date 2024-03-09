//import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import './assets/lessonDepot.css'
/* ---------- START: Font Awesome ----------*/
    /* import the fontawesome core */
    import { library } from '@fortawesome/fontawesome-svg-core'

    /* import font awesome icon component */
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

    /* import specific icons */
    import { faShoppingCart, faTerminal, faTrash, faSync } from '@fortawesome/free-solid-svg-icons'

    /* import specific icons */
    import { faUniregistry } from '@fortawesome/free-brands-svg-icons'

    /* add icons to the library */
    library.add(faShoppingCart, faTerminal, faUniregistry, faTrash, faSync)

    const app = createApp(App); // Create the app instance

    /* add font awesome icon component */
    app.component('font-awesome-icon', FontAwesomeIcon)

    app.config.productionTip = false // Set production tip configuration

/* ---------- END: Font Awesome ---------- */

app.mount('#app') // Mount the app

//createApp(App).mount('#app')
