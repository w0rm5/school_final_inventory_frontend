<template>
  <section class="tables">
    <div class="page-header">
      <h3 class="page-title">
        List of products
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
                    Products on sale
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 1 ? 'primary' : 'outline-primary'"
                    @click="changeTab(1)"
                    class="btn btn-sm"
                  >
                    Discontinued products
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 2 ? 'primary' : 'outline-primary'"
                    @click="changeTab(2)"
                    class="btn btn-sm"
                  >
                    All products
                  </b-button>
                </b-button-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-button variant="success" class="float-right" @click="editProduct('new')">
                  New Product
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group label="Product Name:" lable-cols="12" label-cols-md="3" label-size="sm">
                  <b-form-input
                    v-model="filter.name"
                    placeholder="Search Product Name"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group label="Category:" lable-cols="12" label-cols-md="3" label-size="sm">
                  <b-form-select
                    v-model="filter.category"
                    :options="categories"
                    text-field="name"
                    value-field="_id"
                    placeholder="Search Category"
                  ></b-form-select>
                </b-form-group>
              </b-col>
              <b-col cols="12">
                <b-button
                  variant="info"
                  class="btn btn-sm float-right"
                  @click="getProducts()"
                >
                  Search
                </b-button>
                <b-button
                  variant="info"
                  class="btn btn-sm float-right mr-2 mb-2"
                  @click="clearFilter()"
                >
                  Clear filter
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
                  :items="productsList"
                  :fields="fields"
                >
                  <template #table-busy>
                    <div class="text-center my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong> Loading... </strong>
                    </div>
                  </template>
                  <template #cell(no)="data">
                    {{ option.skip + data.index + 1 }}
                  </template>
                  <template #cell(description)="data">
                    {{ textOverflow(data.item.description, 50) }}
                  </template>
                  <template #cell(name)="data">
                    {{ textOverflow(data.item.name, 20) }}
                  </template>
                  <template #cell(current_sale_price)="data">
                    ${{ data.item.current_sale_price.toFixed(2) }}
                  </template>
                  <template #cell(images)="data">
                    <b-img
                      class="table-image"
                      :src="getImage(data.item.images)"
                      :alt="'Image of ' + data.item.name"
                    ></b-img>
                  </template>
                  <template #cell(discontinued)="data">
                    <b-button
                      disabled
                      :class="
                        'btn btn-' +
                          (data.item.discontinued ? 'danger' : 'success') +
                          ' btn-rounded btn-sm'
                      "
                    >
                      {{ data.item.discontinued ? "Discontinued" : "On-sale" }}
                    </b-button>
                  </template>
                  <template #cell(actions)="data">
                    <b-button
                      class="btn btn-gradient-info btn-rounded btn-icon"
                      v-b-tooltip
                      title="Edit"
                      @click="editProduct(data.item._id)"
                    >
                      <span class="mdi mdi-border-color"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-info btn-rounded btn-icon"
                      v-b-tooltip
                      title="Update Sale Price"
                      @click="showSalePriceModal(data.item)"
                    >
                      <span class="mdi mdi-currency-usd"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-success btn-rounded btn-icon"
                      v-b-tooltip
                      title="Re-sale This Product"
                      v-if="data.item.discontinued"
                      @click="showStatusModal(data.item, false)"
                    >
                      <span class="mdi mdi-backup-restore"></span>
                    </b-button>
                    <b-button
                      class="btn btn-gradient-danger btn-rounded btn-icon"
                      v-b-tooltip
                      title="Discontinue This Product"
                      v-if="!data.item.discontinued"
                      @click="showStatusModal(data.item, true)"
                    >
                      <span class="mdi mdi-delete"></span>
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

      <b-modal
        v-model="showModel"
        :title="modalTitle"
        no-close-on-backdrop
        @hidden="resetModal"
        @ok="handleSalePriceOk"
      >
        <b-form class="pt-3">
          <b-form-group label="New sale price">
            <b-form-input
              type="number"
              class="form-control form-control-lg"
              v-model="newPrice"
              :state="validatePrice()"
            ></b-form-input>
            <b-form-invalid-feedback>{{ salePriceFeedback }}</b-form-invalid-feedback>
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
        <h4>Are you sure you want to {{ newStatus ? "discontinue" : "re-sale" }} this product?</h4>
        <template #modal-footer>
          <div class="w-100">
            <div class="float-right">
              <b-button variant="secondary" size="sm" @click="statusModal = false">
                No
              </b-button>
              <b-button
                :variant="newStatus ? 'danger' : 'success'"
                size="sm"
                @click="confirmUpdateProductStatus"
              >
                Yes
              </b-button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>
  </section>
</template>

<script>
import { listProducts, updateProductSalePrice, upsertProduct } from "@/api/product";
import { listCategory } from "@/api/category";
import { textOverflow, getImage } from "@/util/funcs";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "ProductList",
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
      textOverflow,
      btnGroupIndex: 0,
      productsList: [],
      currentProductId: "",
      showModel: false,
      statusModal: false,
      newStatus: true,
      isBusy: false,
      newPrice: 0,
      modalTitle: "",
      categories: [],
      filter: {
        name: "",
        category: "",
        discontinued: false
      },
      option: {
        limit: 5,
        skip: 0,
      },
      rows: 0,
      currentPage: 1,
      fields: [
        {
          key: "no",
          label: "No."
        },
        {
          key: "images",
          label: "Image"
        },
        {
          key: "name",
          label: "Product Name",
          sortable: true
        },
        {
          key: "category.name",
          label: "Category",
          sortable: true
        },
        {
          key: "barcode",
          label: "Barcode"
        },
        {
          key: "description",
          label: "Description"
        },
        {
          key: "current_quantity",
          label: "Quantity",
          sortable: true
        },
        {
          key: "current_sale_price",
          label: "Sale Price",
          sortable: true
        },
        {
          key: "discontinued",
          label: "Status",
          sortable: true
        },
        "actions"
      ]
    };
  },
  validations: {
    newPrice: {
      required,
      isNum: v => !isNaN(v),
      isNotNegative: v => v > 0
    }
  },
  computed: {
    salePriceFeedback() {
      if (!this.$v.newPrice.required) {
        return "Sale price is required";
      } else if (!this.$v.newPrice.isNum) {
        return "Sale price must be a number";
      } else if(!this.$v.newPrice.isNotNegative) {
        return "Sale price must cannot be negative";
      } else {
        return "";
      }
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
    this.getCategories();
    this.getProducts();
  },
  methods: {
    getCategories() {
      listCategory().then(res => {
        this.categories = res.data;
      }).catch(err => {
        console.log(err);
      });
    },
    pageClick(page) {
      this.option.skip = (page - 1) * this.option.limit;
      this.getProducts();
    },
    validatePrice() {
      const { $dirty, $error } = this.$v.newPrice;
      return $dirty ? !$error : null;
    },
    editProduct(id) {
      this.$router.push({ name: "productEdit", params: { id } });
    },
    changeTab(index) {
      this.btnGroupIndex = index;
      this.option.skip = 0;
      this.currentPage = 1;
      this.getProducts();
    },
    clearFilter() {
      this.filter = {
        name: "",
        category: "",
        discontinued: false
      }
    },
    configFilter() {
      switch (this.btnGroupIndex) {
        case 0:
          this.filter.discontinued = false
          break;
        case 1:
          this.filter.discontinued = true
          break;
        case 2:
          delete this.filter.discontinued
          break;
      }
      if(this.filter.category == "") {
        delete this.filter.category
      }
      if(this.filter.name == "") {
        delete this.filter.name
      }
    },
    getProducts() {
      this.isBusy = true;
      this.configFilter();
      listProducts({ filter: this.filter, option: this.option, populatePath: "category" })
        .then(res => {
          this.rows = res.count;
          this.productsList = res.data;
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.productsList = [];
        });
    },
    showSalePriceModal(item) {
      this.showModel = true;
      this.resetModal();
      this.modalTitle = "Update " + item.name + "'s sale price";
      this.newPrice = item.current_sale_price;
      this.currentProductId = item._id;
    },
    resetModal() {
      this.$v.newPrice.$reset();
    },
    handleSalePriceOk(e) {
      e.preventDefault();
      this.updateSalePrice();
    },
    updateSalePrice() {
      this.$v.newPrice.$touch();
      if (this.$v.newPrice.$invalid) {
        return;
      }
      updateProductSalePrice(this.currentProductId, { update_price: this.newPrice })
        .then(res => {
          this.$bvToast.toast(res.message, {
            title: "Message",
            variant: "success",
            toaster: "b-toaster-top-center"
          });
          this.getProducts();
        })
        .catch(() => {});
      this.showModel = false;
    },
    showStatusModal(item, status) {
      this.statusModal = true;
      this.newStatus = status;
      this.modalTitle = status ? "Warning" : "Re-sale product";
      this.currentProductId = item._id;
    },
    confirmUpdateProductStatus() {
      upsertProduct({ _id: this.currentProductId, discontinued: this.newStatus })
        .then(res => {
          let message = "Product " + (res.data.discontinued ? "discontinued" : "restored");
          this.$bvToast.toast(message, {
            title: "Message",
            variant: "success",
            toaster: "b-toaster-top-center"
          });
          this.getProducts();
        })
        .catch(() => {});
      this.statusModal = false;
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
