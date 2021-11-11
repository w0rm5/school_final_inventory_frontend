<template>
  <section class="app-sidebar">
    <nav class="sidebar sidebar-offcanvas" id="sidebar">
      <ul class="nav">
        <li class="nav-item nav-profile">
          <a href="javascript:void(0);" class="nav-link">
            <div class="nav-profile-image">
              <img :src="profilePic" alt="profile" />
              <span class="login-status online"></span>
            </div>
            <div class="nav-profile-text d-flex flex-column">
              <span class="font-weight-bold mb-2">{{
                userInfo.first_name + " " + userInfo.last_name
              }}</span>
              <span class="text-secondary text-small">{{ userInfo.username }}</span>
            </div>
            <i class="mdi mdi-bookmark-check text-success nav-profile-badge"></i>
          </a>
        </li>
        <li class="nav-item" @click="collapseAll" v-if="userInfo.is_admin">
          <router-link class="nav-link" :to="{ name: 'home' }">
            <span class="menu-title">Home</span>
            <i class="mdi mdi-home menu-icon"></i>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{ name: 'sale' }">
            <span class="menu-title">Sale</span>
            <i class="menu-icon mdi mdi-cart"></i>
          </router-link>
        </li>
        <li class="nav-item" v-for="route in currentRoutes" :key="route.name">
          <span class="nav-link" v-b-toggle="route.meta.collapseId">
            <span class="menu-title">{{ route.meta.text }}</span>
            <i class="menu-arrow"></i>
            <i :class="route.meta.mdi + ' menu-icon'"></i>
          </span>
          <b-collapse accordion="sidebar-accordion" :id="route.meta.collapseId">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item" v-for="child in route.children" :key="child.name">
                <router-link v-if="!child.meta.hidden" class="nav-link" :to="{ name: child.name }">
                  {{ child.meta.text }}
                </router-link>
              </li>
            </ul>
          </b-collapse>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import { RoutesList } from "../../router";
import { getImage } from "@/util/funcs";

export default {
  name: "Sidebar",
  computed: {
    ...mapGetters(["userInfo"]),
    profilePic() {
      return getImage(this.userInfo.profile_pic)
    },
    currentRoutes() {
      return this.userInfo.is_admin ? RoutesList : [];
    }
  },
  watch: {
    $route() {
      document.querySelector("#sidebar").classList.toggle("active");
    }
  },
  mounted() {
    const body = document.querySelector("body");

    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll(".sidebar .nav-item").forEach(function(el) {
      el.addEventListener("mouseover", function() {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.add("hover-open");
        }
      });
      el.addEventListener("mouseout", function() {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.remove("hover-open");
        }
      });
    });
  },
  methods: {
    collapseAll() {
      var exp_elm = document.getElementsByClassName("show");
      if (exp_elm.length > 0) {
        var elm_id = exp_elm[0].id;
        this.$root.$emit("bv::toggle::collapse", elm_id);
      }
    }
  }
};
</script>
