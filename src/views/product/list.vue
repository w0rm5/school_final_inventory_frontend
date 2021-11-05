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
              <b-col>
                <b-button-group>
                  <b-button
                    :variant="btnGroupIndex === 0 ? 'primary' : 'outline-primary'"
                    @click="changeTab(0)"
                  >
                    Products on sale
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 1 ? 'primary' : 'outline-primary'"
                    @click="changeTab(1)"
                  >
                    Discontinued products
                  </b-button>
                  <b-button
                    :variant="btnGroupIndex === 2 ? 'primary' : 'outline-primary'"
                    @click="changeTab(2)"
                  >
                    All products
                  </b-button>
                </b-button-group>
              </b-col>
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
                    {{ data.index + 1 }}
                  </template>
                  <template #cell(description)="data">
                    {{ textOverflow(data.item.description, 50) }}
                  </template>
                  <template #cell(images)="data">
                    <b-img
                      class="table-image"
                      :src="getProductImage(data.item.images)"
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
import serverConfig from "@/util/serverConfig";
import { textOverflow } from "@/util/funcs";
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
      isNum: v => !isNaN(v)
    }
  },
  computed: {
    salePriceFeedback() {
      if (!this.$v.newPrice.required) {
        return "Sale price is required";
      }
      if (!this.$v.newPrice.isNum) {
        return "Sale price must be a number";
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
    this.getProducts();
  },
  methods: {
    getProductImage(images) {
      if (images[0]) {
        return serverConfig.file_url + images[0];
      }
      return serverConfig.no_image_url;
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
      this.getProducts();
    },
    getProducts() {
      this.isBusy = true;
      let filter;
      switch (this.btnGroupIndex) {
        case 0:
          filter = { discontinued: false };
          break;
        case 1:
          filter = { discontinued: true };
          break;
        case 2:
          filter = {};
          break;
      }
      listProducts({ filter, populatePath: "category" })
        .then(res => {
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
