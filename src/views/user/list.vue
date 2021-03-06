<template>
  <section class="tables">
    <div class="page-header">
      <h3 class="page-title">
        List of users
      </h3>
    </div>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row class="mb-3">
              <b-col cols="12" md="6">
                <b-button-group>
                  <b-button
                    :variant="btnGroupIndex === 0 ? 'primary' : 'outline-primary'"
                    @click="changeTab(0)"
                    class="btn btn-sm"
                  >
                    Current users
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 1 ? 'primary' : 'outline-primary'"
                    @click="changeTab(1)"
                    class="btn btn-sm"
                  >
                    Banned users
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 2 ? 'primary' : 'outline-primary'"
                    @click="changeTab(2)"
                    class="btn btn-sm"
                  >
                    All users
                  </b-button>
                </b-button-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-button variant="success" class="float-right" @click="editUser('new')">
                  New User
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-table
                  striped
                  hover
                  responsive
                  stacked="md"
                  sort-icon-left
                  :busy.sync="isBusy"
                  :items="userList"
                  :fields="fields"
                >
                  <template #table-busy>
                    <div class="text-center my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong> Loading...</strong>
                    </div>
                  </template>
                  <template #cell(profile_pic)="data">
                    <b-img
                      class="table-image"
                      :src="getImage(data.item.profile_pic)"
                      :alt="'Profile picuture of ' + data.item.first_name"
                    ></b-img>
                  </template>
                  <template #cell(sex)="data">
                    {{ getSex(data.item.sex) }}
                  </template>
                  <template #cell(date_of_birth)="data">
                    {{ formatDate(data.item.date_of_birth) }}
                  </template>
                  <template #cell(deactivated)="data">
                    <b-button
                      disabled
                      :class="
                        'btn btn-' +
                          (data.item.deactivated ? 'danger' : 'success') +
                          ' btn-rounded btn-sm'
                      "
                    >
                      {{ data.item.deactivated ? "Banned" : "Normal" }}
                    </b-button>
                  </template>
                  <template #cell(is_admin)="data">
                    <b-button
                      disabled
                      :class="
                        'btn btn-gradient-' +
                          (data.item.is_admin ? 'primary' : 'info') +
                          ' btn-rounded btn-sm'
                      "
                    >
                      {{ data.item.is_admin ? "Admin" : "User" }}
                    </b-button>
                  </template>
                  <template #cell(actions)="data">
                    <b-button
                      class="btn btn-gradient-info btn-rounded btn-icon"
                      v-b-tooltip
                      title="Edit Info"
                      @click="editUser(data.item._id)"
                    >
                      <span class="mdi mdi-border-color"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-primary btn-rounded btn-icon"
                      v-b-tooltip
                      v-if="!data.item.deactivated"
                      title="Reset Password"
                      @click="showResetPasswordModel(data.item._id)"
                    >
                      <span class="mdi mdi-autorenew"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-success btn-rounded btn-icon"
                      v-b-tooltip
                      title="Re-activate This User"
                      v-if="data.item.deactivated"
                      @click="showStatusModal(data.item._id, false)"
                    >
                      <span class="mdi mdi-account-convert"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-danger btn-rounded btn-icon"
                      v-b-tooltip
                      title="Diactivate This User"
                      v-else
                      @click="showStatusModal(data.item._id, true)"
                    >
                      <span class="mdi mdi-account-off"></span>
                    </b-button>
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="rows > 0">
              <b-col>
                <b-pagination
                  v-model="currentPage"
                  :total-rows="rows"
                  per-page="5"
                  align="center"
                  @change="pageClick"
                ></b-pagination>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      v-model="passwordModel"
      title="Reset password"
      no-close-on-backdrop
      @hidden="resetPasswordModal"
      @ok="handleResetPasswordOk"
    >
      <b-form class="pt-3" @submit.stop.prevent>
        <b-form-group label="New password">
          <b-form-input
            class="form-control form-control-lg"
            v-model="newPassword"
            :state="validatePassword()"
          ></b-form-input>
          <b-form-invalid-feedback>{{ newPasswordFeedback }}</b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      v-model="statusModal"
      :title="modalTitle"
      no-close-on-backdrop
      :header-bg-variant="newStatus ? 'danger' : 'success'"
      header-text-variant="light"
    >
      <h4>
        Are you sure you want to {{ newStatus ? "deactivate" : "re-activate" }} this user account?
      </h4>
      <template #modal-footer>
        <div class="w-100">
          <div class="float-right">
            <b-button variant="secondary" size="sm" @click="statusModal = false">
              No
            </b-button>
            <b-button
              :variant="newStatus ? 'danger' : 'success'"
              size="sm"
              @click="confirmUpdateStatus"
            >
              Yes
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </section>
</template>

<script>
import moment from "moment";
import { getImage } from "@/util/funcs";
import { listUser, updateUser, forceResetPassword } from "@/api/user";
import { sexes } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required, minLength } from "vuelidate/lib/validators";

export default {
  name: "UserList",
  mixins: [validationMixin],
  props: {
    toastMessage: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      getImage,
      btnGroupIndex: 0,
      modalTitle: "",
      filter: {
        deactivated: false,
      },
      option: {
        limit: 5,
        skip: 0,
      },
      rows: 0,
      currentPage: 1,
      passwordModel: false,
      statusModal: false,
      newStatus: true,
      selectedUserId: "",
      newPassword: "",
      isBusy: false,
      userList: [],
      fields: [
        {
          key: "user_id",
          label: "ID"
        },
        {
          key: "profile_pic",
          label: "Profile"
        },
        {
          key: "first_name",
          label: "First Name",
          sortable: true
        },
        {
          key: "last_name",
          label: "Last Name",
          sortable: true
        },
        {
          key: "username",
          label: "Login Name",
          sortable: true
        },
        {
          key: "sex",
          label: "Sex",
          sortable: true
        },
        {
          key: "date_of_birth",
          label: "Date Of Birth",
          sortable: true
        },
        {
          key: "is_admin",
          label: "Role"
        },
        {
          key: "deactivated",
          label: "Status",
          sortable: true
        },
        "actions"
      ]
    };
  },
  validations: {
    newPassword: {
      required,
      minLength: minLength(6)
    }
  },
  computed: {
    newPasswordFeedback() {
      if (!this.$v.newPassword.required) {
        return "This field is required";
      }
      if (!this.$v.newPassword.minLength) {
        return "Password must be at least 6 characters.";
      }
      return "";
    }
  },
  mounted() {
    if (this.toastMessage) {
      this.$bvToast.toast(this.toastMessage, {
        title: "Message",
        variant: "success",
        toaster: "b-toaster-top-center"
      });
    }
    this.getUsers();
  },
  methods: {
    validatePassword() {
      const { $dirty, $error } = this.$v.newPassword;
      return $dirty ? !$error : null;
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    getSex(sex) {
      return Object.keys(sexes).find(e => sexes[e] === sex) ;
    },
    showStatusModal(id, status) {
      this.statusModal = true;
      this.newStatus = status;
      this.modalTitle = status ? "Warning" : "Re-activate user";
      this.selectedUserId = id;
    },
    resetPasswordModal() {
      this.$v.newPassword.$reset();
    },
    showResetPasswordModel(id) {
      this.selectedUserId = id;
      this.resetPasswordModal();
      this.passwordModel = true;
    },
    handleResetPasswordOk(e) {
      e.preventDefault();
      this.$v.newPassword.$touch();
      if (this.$v.newPassword.$invalid) {
        return;
      }
      forceResetPassword({ user_id: this.selectedUserId, newPassowrd: this.newPassword })
        .then(res => {
          this.$bvToast.toast(res.message, {
            title: "Message",
            variant: "success",
            toaster: "b-toaster-top-center"
          });
          this.newPassword = ""
          this.getUsers();
        })
        .catch(err => {
          console.log(err);
        });
      this.passwordModel = false;
    },
    confirmUpdateStatus() {
      updateUser({ _id: this.selectedUserId, deactivated: this.newStatus })
        .then(res => {
          let message = "User account " + (res.data.deactivated ? "deactivated" : "re-activated");
          this.$bvToast.toast(message, {
            title: "Message",
            variant: "success",
            toaster: "b-toaster-top-center"
          });
          this.getUsers();
        })
        .catch(err => {
          console.log(err);
        });
      this.statusModal = false;
    },
    editUser(id) {
      this.$router.push({ name: "userEdit", params: { id } });
    },
    pageClick(page) {
      this.option.skip = (page - 1) * this.option.limit;
      this.getUsers();
    },
    changeTab(index) {
      this.btnGroupIndex = index;
      this.option.skip = 0;
      this.currentPage = 1;
      this.getUsers();
    },
    configFilter() {
      switch (this.btnGroupIndex) {
        case 0:
          this.filter.deactivated = false
          break;
        case 1:
          this.filter.deactivated = true
          break;
        case 2:
          delete this.filter.deactivated
          break;
      }
    },
    getUsers() {
      this.isBusy = true;
      this.configFilter();
      listUser({ filter: this.filter, option: this.option })
        .then(res => {
          this.rows = res.count;
          this.userList = res.data;
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.rows = 0;
          this.userList = [];
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.table-image {
  width: 75px;
  height: 75px;
}
</style>
