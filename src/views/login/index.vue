<template>
  <section class="login">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row w-100 flex-grow">
            <div class="col-xl-4 col-lg-6 mx-auto">
              <div class="auth-form-light text-left p-5">
                <div class="brand-logo text-center">
                  <img src="../../assets/images/logo.svg" />
                </div>
                <h4 class="text-center">
                  Welcome! Sign in to continue
                </h4>
                <b-form class="pt-3" @submit.stop.prevent="userLogin">
                  <b-form-group>
                    <b-form-input
                      class="form-control form-control-lg"
                      placeholder="Username"
                      v-model="authObj.username"
                      :state="validateState('username')"
                    ></b-form-input>
                    <b-form-invalid-feedback>Username field is required</b-form-invalid-feedback>
                  </b-form-group>
                  <b-form-group>
                    <b-form-input
                      type="password"
                      class="form-control form-control-lg"
                      placeholder="Password"
                      v-model="authObj.password"
                      :state="validateState('password')"
                    ></b-form-input>
                    <b-form-invalid-feedback>Password field is required</b-form-invalid-feedback>
                  </b-form-group>
                  <b-button
                    type="submit"
                    class="btn btn-block btn-gradient-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    SIGN IN
                  </b-button>
                  <div class="form-check">
                    <label class="form-check-label text-muted">
                      <input type="checkbox" class="form-check-input" v-model="rememberMe">
                      Keep me signed in
                      <i class="input-helper"></i>
                    </label>
                  </div>
                </b-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { login, getUserInfo } from "@/api/auth";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "Login",
  mixins: [validationMixin],
  props: {
    errorMessage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      authObj: {
        username: "",
        password: ""
      },
      rememberMe: false,
    };
  },
  validations: {
    authObj: {
      username: {
        required
      },
      password: {
        required
      }
    }
  },
  mounted(){
    if(this.errorMessage) {
       this.$bvToast.toast(this.errorMessage, {
        title: "Session expired",
        variant: "warning",
        toaster: "b-toaster-top-center"
      })
    }
  },
  methods: {
    validateState(name) {
      const { $dirty, $error } = this.$v.authObj[name];
      return $dirty ? !$error : null;
    },
    userLogin() {
      this.$v.authObj.$touch();
      if (this.$v.authObj.$anyError) {
        return;
      }
      login(this.authObj)
        .then(res => {
          this.$store
            .dispatch("Login", {
              token: res.token,
              remember: this.rememberMe
            })
            .then(() => {
              getUserInfo().then(res => {
                this.$store.dispatch("SetUserInfo", res.info)
                .then(() => {
                  this.$router.push({ name: "home" });
                });
              });
            });
        }).catch(() => {})
    }
  }
};
</script>
