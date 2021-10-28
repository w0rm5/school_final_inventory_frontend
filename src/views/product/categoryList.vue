<template>
  <section class="tables">
    <div class="page-header">
      <h3 class="page-title">
        List of categories
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
                  @click="editCategory({ name: '', _id: '' })"
                >
                  New Product
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
                  :items="categoryList"
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
                      @click="editCategory(data.item)"
                    >
                      <span class="mdi mdi-border-color"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-danger btn-rounded btn-icon"
                      v-b-tooltip
                      title="Delete"
                      @click="deleteCategory(data.item)"
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
          <b-form-invalid-feedback>{{ categoryNameFeedback }}</b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      v-model="deleteModal"
      title="Delete category"
      no-close-on-backdrop
      header-bg-variant="danger"
      header-text-variant="light"
    >
      <h4>Are you sure you want to delete "{{ editItem.name }}" category?</h4>
      <template #modal-footer>
        <div class="w-100">
          <div class="float-right">
            <b-button variant="secondary" size="sm" @click="deleteModal = false">
              No
            </b-button>
            <b-button variant="danger" size="sm" @click="confirmDeleteCategory">
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
  listCategory,
  upsertCategory,
  checkCategoryName,
  deleteCategoryById
} from "@/api/category";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { meta } from "@/util/enum";

export default {
  name: "CategoryList",
  mixins: [validationMixin],
  data() {
    return {
      categoryList: [],
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
          label: "Category Name",
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
          let res = await checkCategoryName(value);
          return res.meta === meta.NOT_FOUND;
        }
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editItem._id ? "Edit Category" : "New Category";
    },
    categoryNameFeedback() {
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
      listCategory()
        .then(res => {
          this.categoryList = res.data;
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.categoryList = [];
        });
    },
    resetModal() {
      this.$v.editItem.$reset();
    },
    handleOk(e) {
      e.preventDefault();
      this.saveCategory();
    },
    saveCategory() {
      this.$v.editItem.$touch();
      if (this.$v.editItem.$invalid) {
        return;
      }
      upsertCategory(this.editItem)
        .then(res => {
          console.log("then", res);
          this.getCategories();
        })
        .catch(err => {
          console.log(err);
        });
      this.showModel = false;
    },
    editCategory(cat) {
      this.editItem = Object.assign({}, cat) ;
      this.resetModal();
      this.showModel = true;
    },
    deleteCategory(cat) {
      this.editItem = cat;
      this.deleteModal = true;
    },
    confirmDeleteCategory() {
      deleteCategoryById(this.editItem._id)
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
