import Vue from "vue";
import Router from "vue-router";
import Home from "./pages/Home.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        //// HOME ////
        {
            path: "/",
            name: "Home",
            component: Home
        },
        //// APIs ////
        {
            path: "/Spotify",
            name: "Spotify",
            // This is lazy-loading syntax to import the Component
            component: () => import("./pages/Spotify.vue")
        },
    ]
});
