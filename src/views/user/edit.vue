<template>
  <section>
    <div class="page-header">
      <h3 class="page-title">
        {{ user._id ? "Edit User Info" : "Add New User" }}
      </h3>
    </div>
    <div class="row">
      <div class="col-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-form @submit.stop.prevent="saveUser">
              <b-form-row>
                <b-col cols="12" md="3" sm="4">
                  <b-form-group label="Profile picture">
                    <b-img :src="previewImages"></b-img>
                    <b-form-file
                      v-model="newProfilePic"
                      accept="image/jpeg, image/png"
                      placeholder="Upload Profile Picture"
                    ></b-form-file>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="9" sm="8">
                  <b-form-group label="ID">
                    <b-form-input
                      placeholder="User ID"
                      v-model.trim="user.user_id"
                      :state="validateState('user_id')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.user.user_id.required">
                      ID is required
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-if="!$v.user.user_id.isUnique">
                      Current ID is already assigned
                    </b-form-invalid-feedback>
                  </b-form-group>
                  <b-form-group label="Sex">
                    <b-form-select v-model="user.sex" :options="sexesOptions"></b-form-select>
                  </b-form-group>
                  <b-form-group label="Date of birth">
                    <date-picker
                      :clearable="false"
                      v-model="user.date_of_birth"
                      placeholder="Date of birth"
                    ></date-picker>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12" md="6">
                  <b-form-group label="First name">
                    <b-form-input
                      placeholder="First name"
                      v-model.trim="user.first_name"
                      :state="validateState('first_name')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.user.first_name.required">
                      First name is required
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="6">
                  <b-form-group label="Last name">
                    <b-form-input
                      placeholder="Last name"
                      v-model.trim="user.last_name"
                      :state="validateState('last_name')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.user.last_name.required">
                      Last name is required
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="6">
                  <b-form-group label="Username">
                    <b-form-input
                      placeholder="Username"
                      v-model.trim="user.username"
                      :state="validateState('username')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.user.username.required">
                      Username is required
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-if="!$v.user.username.isUnique">
                      Username is already in used
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="6" v-if="$route.params.id === 'new'">
                  <b-form-group label="Password">
                    <b-form-input
                      placeholder="Password"
                      v-model="password"
                      :state="validatePasswordState()"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.password.required">
                      New password is required
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-else-if="!$v.password.minLength">
                      New password must be at least 6 characters
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12" md="4">
                  <b-form-checkbox v-model="user.is_admin">
                    Make this user an admin
                  </b-form-checkbox>
                </b-col>
                <b-col cols="12" md="8">
                  <b-button
                    class="
                      btn btn-gradient-success btn-fw
                      mt-3
                      ml-3
                      float-right
                    "
                    type="submit"
                  >
                    Save
                  </b-button>
                  <b-button
                    class="btn btn-gradient-dark btn-fw mt-3 ml-3 float-right"
                    @click="$router.push({ name: 'userList' })"
                  >
                    Cancel
                  </b-button>
                </b-col>
              </b-form-row>
            </b-form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { singleUpload, deleteFile } from "@/api/upload";
import moment from "moment";
import { getImage } from "@/util/funcs";
import { getUser, checkUserExist, updateUser, registerUser } from "@/api/user";
import { meta, sexes } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required, minLength } from "vuelidate/lib/validators";
import DatePicker from "vue2-datepicker";

export default {
  name: "UserEdit",
  components: {
    DatePicker
  },
  mixins: [validationMixin],
  data() {
    return {
      newProfilePic: null,
      sexesOptions: Object.keys(sexes).map(e => {
        return { text: e, value: sexes[e] };
      }),
      user: {
        first_name: "",
        last_name: "",
        user_id: "",
        sex: sexes.Male,
        date_of_birth: moment("1994-01-01").toDate(),
        username: "",
        profile_pic: "",
        is_admin: false,
        deactivated: false,
      },
      password: ""
    };
  },
  validations: {
    user: {
      first_name: {
        required
      },
      last_name: {
        required
      },
      user_id: {
        required,
        async isUnique(value) {
          if (value === "") return true;
          let res = await checkUserExist({ user_id: value });
          return res.meta === meta.NOT_FOUND || res.id === this.user._id;
        }
      },
      username: {
        required,
        async isUnique(value) {
          if (value === "") return true;
          let res = await checkUserExist({ username: value });
          return res.meta === meta.NOT_FOUND || res.id === this.user._id;
        }
      }
    },
    password: {
      required,
      minLength: minLength(6)
    }
  },
  computed: {
    previewImages() {
      return this.newProfilePic
        ? URL.createObjectURL(this.newProfilePic)
        : getImage(this.user.profile_pic);
    }
  },
  created() {
    let id = this.$route.params.id;
    if (id !== "new") {
      getUser(id)
        .then(res => {
          this.user = res.data;
          this.user.date_of_birth = moment(this.user.date_of_birth).toDate();
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  methods: {
    validateState(name) {
      const { $dirty, $error } = this.$v.user[name];
      return $dirty ? !$error : null;
    },
    validatePasswordState() {
      const { $dirty, $error } = this.$v.password;
      return $dirty ? !$error : null;
    },
    upsert() {
      if (this.$route.params.id === "new") {
        this.user.password = this.password;
        registerUser(this.user)
          .then(() => {
            this.$router.push({
              name: "userList",
              params: {
                toastMessage: "New user added"
              }
            });
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        updateUser(this.user)
          .then(() => {
            this.$router.push({
              name: "userList",
              params: {
                toastMessage: "User info updated"
              }
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    uploadThenUpsert() {
      let form = new FormData();
      form.append("file", this.newProfilePic);
      singleUpload(form)
        .then(res => {
          this.user.profile_pic = res.file.filename;
          this.upsert();
        })
        .catch(err => {
          console.log(err);
        });
    },
    saveUser() {
      this.$v.user.$touch();
      if (this.$route.params.id === "new") {
        this.$v.password.$touch();
      }
      let valid =
        !this.$v.user.$invalid &&
        (this.$route.params.id !== "new" ||
          (this.$route.params.id === "new" && !this.$v.password.$invalid));
      if (valid) {
        if (this.newProfilePic) {
          if (this.user.profile_pic) {
            deleteFile(this.user.profile_pic)
              .then(() => {
                this.uploadThenUpsert();
              })
              .catch(err => {
                if (err.meta == meta.NOT_FOUND) {
                  this.uploadThenUpsert();
                }
                console.log(err);
              });
          } else {
            this.uploadThenUpsert();
          }
        } else {
          this.upsert();
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  display: block;
  padding: 0px 0px 5px 0px;
  height: 200px;
  max-width: 100%;
  margin: 0 auto;
}
</style>
