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
                  Welcome! let's get started
                </h4>
                <form class="pt-3">
                  <div class="form-group">
                    <input
                      type="email"
                      class="form-control form-control-lg"
                      id="exampleInputEmail1"
                      placeholder="Username"
                      v-model="authObj.username"
                    />
                  </div>
                  <div class="form-group">
                    <input
                      type="password"
                      class="form-control form-control-lg"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      v-model="authObj.password"
                    />
                  </div>
                  <div class="mt-3">
                    <div
                      class="btn btn-block btn-gradient-primary btn-lg font-weight-medium auth-form-btn"
                      @click="userLogin"
                    >
                      SIGN IN
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <!-- content-wrapper ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
  </section>
</template>

<script>
import { login } from "@/api/auth";

export default {
  name: "Login",
  data() {
    return {
      authObj: {
        username: "",
        password: ""
      }
    };
  },
  methods: {
    userLogin() {
      login(this.authObj)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
