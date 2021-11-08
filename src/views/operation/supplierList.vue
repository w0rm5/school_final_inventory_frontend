<template>
  <section class="tables">
    <div class="page-header">
      <h3 class="page-title">
        List of suppliers
      </h3>
    </div>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row class="mb-3">
              <b-col>
                <b-button
                  variant="success"
                  class="float-right"
                  @click="editSupplier({ name: '', _id: '' })"
                >
                  New Supplier
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
                  :items="supplierList"
                  :fields="fields"
                >
                  <template #table-busy>
                    <div class="text-center my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong> Loading...</strong>
                    </div>
                  </template>
                  <template #cell(no)="data">
                    {{ data.index + 1 }}
                  </template>
                  <template #cell(actions)="data">
                    <b-button
                      class="btn btn-gradient-info btn-rounded btn-icon"
                      v-b-tooltip
                      title="Edit"
                      @click="editSupplier(data.item)"
                    >
                      <span class="mdi mdi-border-color"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-danger btn-rounded btn-icon"
                      v-b-tooltip
                      title="Delete"
                      @click="deleteSupplier(data.item)"
                    >
                      <span class="mdi mdi-delete"></span>
                    </b-button>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>

    <b-modal
      v-model="showModel"
      :title="modalTitle"
      no-close-on-backdrop
      @hidden="resetModal"
      @ok="handleOk"
    >
      <b-form class="pt-3">
        <b-form-group label="Name">
          <b-form-input
            class="form-control form-control-lg"
            v-model="editItem.name"
            :state="validateName()"
          ></b-form-input>
          <b-form-invalid-feedback>{{ supplierNameFeedback }}</b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      v-model="deleteModal"
      title="Delete supplier"
      no-close-on-backdrop
      header-bg-variant="danger"
      header-text-variant="light"
    >
      <h4>Are you sure you want to delete "{{ editItem.name }}" supplier?</h4>
      <template #modal-footer>
        <div class="w-100">
          <div class="float-right">
            <b-button variant="secondary" size="sm" @click="deleteModal = false">
              No
            </b-button>
            <b-button variant="danger" size="sm" @click="confirmDeleteSupplier">
              Yes
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </section>
</template>

<script>
import {
  listSuppliers,
  upsertSupplier,
  checkSupplierName,
  deleteSupplierById
} from "@/api/supplier";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { meta } from "@/util/enum";

export default {
  name: "SupplierList",
  mixins: [validationMixin],
  data() {
    return {
      supplierList: [],
      editItem: {
        name: "",
        _id: ""
      },
      isBusy: false,
      showModel: false,
      deleteModal: false,
      fields: [
        {
          key: "no",
          label: "No."
        },
        {
          key: "name",
          label: "Supplier Name",
          sortable: true
        },
        "actions"
      ]
    };
  },
  validations: {
    editItem: {
      name: {
        required,
        async isUnique(value) {
          if (value === "") return true;
          let res = await checkSupplierName(value);
          return res.meta === meta.NOT_FOUND;
        }
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editItem._id ? "Edit Supplier" : "New Supplier";
    },
    supplierNameFeedback() {
      if (!this.$v.editItem.name.required) {
        return "Name is required";
      }
      if (!this.$v.editItem.name.isUnique) {
        return "Name must be unique";
      }
      return "";
    }
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    validateName() {
      const { $dirty, $error } = this.$v.editItem.name;
      return $dirty ? !$error : null;
    },
    getCategories() {
      this.isBusy = true;
      listSuppliers()
        .then(res => {
          this.supplierList = res.data;
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.supplierList = [];
        });
    },
    resetModal() {
      this.$v.editItem.$reset();
    },
    handleOk(e) {
      e.preventDefault();
      this.saveSupplier();
    },
    saveSupplier() {
      this.$v.editItem.$touch();
      if (this.$v.editItem.$invalid) {
        return;
      }
      upsertSupplier(this.editItem)
        .then(res => {
          console.log("then", res);
          this.getCategories();
        })
        .catch(err => {
          console.log(err);
        });
      this.showModel = false;
    },
    editSupplier(cat) {
      this.editItem = Object.assign({}, cat) ;
      this.resetModal();
      this.showModel = true;
    },
    deleteSupplier(cat) {
      this.editItem = cat;
      this.deleteModal = true;
    },
    confirmDeleteSupplier() {
      deleteSupplierById(this.editItem._id)
        .then(() => {
          this.getCategories()
        })
        .catch(err => {
          console.log(err);
        });
      this.deleteModal = false;
    }
  }
};
</script>

<style></style>
