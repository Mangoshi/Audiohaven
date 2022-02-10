<template>
  <!-- Sidebar -->
  <v-navigation-drawer

      v-model="drawer"
      app
  >
    <v-list>
      <v-list-item-group>
        <!-- Home Page -->
        <v-list-item class="mb-10" to="/">
          <router-link to="/"><v-icon>mdi-home</v-icon>&nbsp;Home</router-link>
        </v-list-item>
        <!-- Spotify Page -->
        <v-list-item class="mb-10" to="/">
          <router-link to="Spotify"><v-icon>mdi-spotify</v-icon>&nbsp;Spotify</router-link>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "NavSideBar"
}
</script>

<style>

</style>