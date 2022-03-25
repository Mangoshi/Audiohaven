import Vue from "vue";
import Router from "vue-router";
import Home from "./pages/Home.vue";
import Spotify from "./pages/Spotify.vue"

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
            component: Spotify
        },
    ]
});
