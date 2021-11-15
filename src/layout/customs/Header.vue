<template>
  <b-navbar
    id="template-header"
    class="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row"
    toggleable="lg"
  >
    <div class="text-center navbar-brand-wrapper d-flex align-items-top justify-content-center">
      <router-link class="navbar-brand brand-logo" to="/">
        <img src="@/assets/images/logo.svg" alt="logo" />
      </router-link>
      <router-link class="navbar-brand brand-logo-mini" to="/">
        <img src="@/assets/images/logo-mini.svg" alt="logo" />
      </router-link>
    </div>
    <div class="navbar-menu-wrapper d-flex align-items-center ml-auto ml-lg-0">
      <button
        class="navbar-toggler navbar-toggler align-self-center d-lg-block"
        type="button"
        @click="toggleSidebar()"
        v-if="userInfo.is_admin"
      >
        <span class="mdi mdi-menu"></span>
      </button>
      <b-navbar-nav class="navbar-nav-right ml-auto">
        <b-nav-item-dropdown right class="nav-profile">
          <template slot="button-content">
            <span
              class="nav-link dropdown-toggle"
              id="profileDropdown"
              href="javascript:void(0);"
              data-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="nav-profile-img">
                <img :src="profilePic" alt="image" />
                <span class="availability-status online"></span>
              </div>
              <div class="nav-profile-text">
                <p class="mb-1 text-black">{{ userInfo.first_name + " " + userInfo.last_name }}</p>
              </div>
            </span>
          </template>
          <b-dropdown-item class="preview-item" @click="showModal = true">
            <i class="mdi mdi-cached mr-2 text-success"></i> Reset Password
          </b-dropdown-item>
          <b-dropdown-item class="preview-item" @click="logout">
            <i class="mdi mdi-logout mr-2 text-primary"></i> Signout
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item class="nav-logout d-none d-lg-block">
          <i class="mdi mdi-power" @click="logout"></i>
        </b-nav-item>
      </b-navbar-nav>
      <button
        class="navbar-toggler navbar-toggler-right align-self-center"
        type="button"
        @click="toggleMobileSidebar()"
      >
        <span class="mdi mdi-menu"></span>
      </button>
    </div>
    <b-modal
      v-model="showModal"
      title="Reset password"
      no-close-on-backdrop
      @ok="confirmResetPassword"
      @hidden="resetStates"
    >
      <b-form>
        <b-form-group label="Old Password">
          <b-form-input
            type="password"
            placeholder="Old Password"
            v-model="oldPassword"
            :state="validateState('oldPassword')"
          ></b-form-input>
          <b-form-invalid-feedback v-if="!$v.oldPassword.required">
            Old password is required
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="New Password">
          <b-form-input
            type="password"
            placeholder="New Password"
            v-model="newPassword"
            :state="validateState('newPassword')"
          ></b-form-input>
          <b-form-invalid-feedback v-if="!$v.oldPassword.required">
            New password is required
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-else-if="!$v.oldPassword.minLength">
            New password must be at least 6 characters
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="Confirm Password">
          <b-form-input
            type="password"
            placeholder="Confirm Password"
            v-model="confirmPassword"
            :state="validateState('confirmPassword')"
          ></b-form-input>
          <b-form-invalid-feedback v-if="!$v.confirmPassword.required">
            Confirm password is required
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-else-if="!$v.confirmPassword.sameAsPassword">
            Password do not match
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>
    <b-modal
      v-model="showPasswordResetModal"
      title="Password reset successful"
      no-close-on-backdrop
      ok-only
      header-bg-variant="success"
      header-text-variant="white"
      body-bg-variant="light"
      @ok="logout"
    >
      <p class="my-4">
        Password reset successfully, please login again!
      </p>
    </b-modal>
  </b-navbar>
</template>

<script>
import { mapGetters } from "vuex";
import { getImage } from "@/util/funcs";
import { resetPassword } from "@/api/user";
import { validationMixin } from "vuelidate";
import { required, sameAs, minLength } from "vuelidate/lib/validators";

export default {
  name: "AppHeader",
  mixins: [validationMixin],
  data() {
    return {
      showModal: false,
      showPasswordResetModal: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
  },
  validations: {
    oldPassword: { required },
    newPassword: {
      required,
      minLength: minLength(6)
    },
    confirmPassword: {
      required,
      sameAsPassword: sameAs('newPassword')
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    profilePic() {
      return getImage(this.userInfo.profile_pic);
    }
  },
  mounted() {
    if(!this.userInfo.is_admin) {
      this.toggleSidebar()
    }
  },
  methods: {
    validateState(name) {
      const { $dirty, $error } = this.$v[name];
      return $dirty ? !$error : null;
    },
    resetStates() {
      this.$v.oldPassword.$reset();
      this.$v.newPassword.$reset();
      this.$v.confirmPassword.$reset();
    },
    confirmResetPassword(e) {
      e.preventDefault();
      this.$v.oldPassword.$touch();
      this.$v.newPassword.$touch();
      this.$v.confirmPassword.$touch();
      if(this.$v.oldPassword.$invalid || this.$v.newPassword.$invalid || this.$v.confirmPassword.$invalid) {
        return;
      }
      let data = {
        oldPassword: this.oldPassword,
        newPassowrd: this.newPassword
      };
      resetPassword(data).then(() => {
        this.showModal = false;
        this.resetStates();
        this.showPasswordResetModal = true;
      }).catch(err => {
        console.log(err);
      });
    },
    toggleSidebar: () => {
      document.querySelector("body").classList.toggle("sidebar-icon-only");
    },
    toggleMobileSidebar: () => {
      document.querySelector("#sidebar").classList.toggle("active");
    },
    logout() {
      this.$store.dispatch("Logout").then(() => {
        this.$router.push({ name: "login" });
      });
    }
  }
};
</script>

<style scoped></style>
