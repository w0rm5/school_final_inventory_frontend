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
                <b-button variant="success" class="float-right" @click="editProduct('new')">
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
  </section>
</template>

<script>
import { listCategory } from "@/api/category";
import { validationMixin } from "vuelidate";
export default {
  name: "CategoryListCom",
  mixins: [validationMixin],
  data() {
    return {
      categoryList: [],
      editItem: {},
      isBusy: false,
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
  mounted() {
    this.getCategories();
  },
  methods: {
    getCategories() {
      this.isBusy = true;
      listCategory()
        .then(res => {
          this.categoryList = res.data;
          console.log(res);
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.categoryList = [];
        });
    },
    editCategory(cat) {
      this.editItem = cat;
      console.log(cat);
    }
  }
};
</script>

<style></style>
