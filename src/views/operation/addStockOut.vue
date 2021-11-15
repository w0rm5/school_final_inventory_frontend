<template>
  <section>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row>
              <b-col cols="12" md="4">
                <b-form-group label="Stock out type: ">
                  <b-form-select v-model="stock_out.type" class="pt-2" :options="stock_out_types">
                  </b-form-select>
                </b-form-group>
              </b-col>
              <b-col cols="12" md="8">
                <b-button variant="success" class="float-right" @click="showModel = true">
                  Add Product
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12">
                <b-form-group label="Remarks">
                  <b-textarea v-model="stock_out.remarks" :state="validateState()"></b-textarea>
                  <b-form-invalid-feedback v-if="!$v.stock_out.remarks.required">
                    Remarks are required
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-table
                  :items="stock_out_items"
                  :fields="fields"
                  hover
                  responsive
                  stacked="md"
                  sort-icon-left
                >
                  <template #cell(no)="data">
                    {{ data.index + 1 }}
                  </template>
                  <template #cell(name)="data">
                    {{ textOverflow(data.item.name, 50) }}
                  </template>
                  <template #cell(images)="data">
                    <b-img
                      class="table-image"
                      :src="data.item.image"
                      :alt="'Image of ' + data.item.name"
                    ></b-img>
                  </template>
                  <template #cell(quantity)="data">
                    <b-form-input
                      v-model.number="data.item.quantity"
                      type="number"
                      min="1"
                      :max="data.item.current_quantity"
                      class="form-control"
                      @change="quantityChange(data.item)"
                    ></b-form-input>
                  </template>
                  <template #cell(cost)="data">
                    {{ data.item.quantity * data.item.current_sale_price }}
                  </template>
                  <template #cell(remove)="data">
                    <b-button
                      class="btn btn-danger btn-rounded btn-icon btn-sm remove-btn"
                      @click="removeItem(data.index)"
                    >
                      <i class="mdi mdi-close"></i>
                    </b-button>
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="stock_out_items.length">
              <b-col>
                <b-button variant="success" class="float-right" @click="confirmAddStockOut">
                  Add Stock Out
                </b-button>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      v-model="showModel"
      size="xl"
      scrollable
      no-close-on-backdrop
      ok-only
      @hide="clearSearchResults"
    >
      <template #modal-header>
        <b-container fluid>
          <b-row>
            <b-col class="mb-4">
              <h5>Select products</h5>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="12" md="6" class="py-2">
              <b-input-group>
                <b-form-input
                  placeholder="Search product by name"
                  @keypress.enter="searchProducts"
                  v-model="filter.name"
                ></b-form-input>
                <b-input-group-append>
                  <b-button class="btn btn-gradient-info" @click="searchProducts">
                    <span class="mdi mdi-magnify"></span>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-col>
            <b-col cols="12" md="6" class="py-2">
              <b-input-group>
                <b-form-input
                  placeholder="Search product by barcode"
                  v-model="filter.barcode"
                  @keypress.enter="searchProducts"
                ></b-form-input>
                <b-input-group-append>
                  <b-button class="btn btn-gradient-info" @click="searchProducts">
                    <span class="mdi mdi-magnify"></span>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-col>
          </b-row>
        </b-container>
      </template>
      <div class="text-center" v-if="computedModalMessage">
        {{ computedModalMessage }}
      </div>
      <b-container fluid v-if="filteredProducts.length">
        <b-row>
          <b-col cols="12" class="vh-50">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mx-4">
                Image
              </h5>
              <h5>Products</h5>
              <h5 class="mx-md-4">
                Quantity
              </h5>
            </div>
            <b-list-group>
              <b-list-group-item
                v-for="product in filteredProducts"
                :key="product._id"
                @click="addProduct(product)"
              >
                <div class="d-flex w-100 justify-content-between">
                  <b-img
                    class="rounded-circle"
                    :src="getImage(product.images)"
                    alt="Product Image"
                    width="50"
                    height="50"
                  ></b-img>

                  <span>
                    {{ textOverflow(product.name, 20) }}
                  </span>
                  <span class="mx-md-4">
                    {{ product.current_quantity }}
                  </span>
                </div>
              </b-list-group-item>
            </b-list-group>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </section>
</template>

<script>
import { listProducts } from "@/api/product";
import { createStockOut } from "@/api/stock-out";
import { textOverflow, getImage } from "@/util/funcs";
import { stockOutTypes } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "AddStockOut",
  mixins: [validationMixin],
  data() {
    return {
      getImage,
      filter: { discontinued: false, current_quantity: true, name: "", barcode: "" },
      stockOutTypes,
      stock_out_types: [
        { text: "Scrapping", value: stockOutTypes.SCRAP },
        { text: "Manual Decrease", value: stockOutTypes.ADMIN_DECREASE }
      ],
      modalMessage: "",
      textOverflow,
      showModel: false,
      stock_out: {
        type: stockOutTypes.SCRAP,
        remarks: "",
        total_amount: 0
      },
      stock_out_items: [],
      searchResults: [],
      fields: [
        {
          key: "no",
          label: "No",
          width: "5%"
        },
        {
          key: "images",
          label: "Image"
        },
        {
          key: "name",
          label: "Name",
          sortable: true
        },
        {
          key: "quantity",
          label: "Quantity",
          tdClass: "table-input-field"
        },
        {
          key: "cost",
          label: "Cost",
          tdClass: "table-input-field"
        },
        {
          key: "remove",
          label: "Remove",
          tdClass: "text-center table-remove-field"
        }
      ]
    };
  },
  validations: {
    stock_out: {
      remarks: {
        required
      }
    }
  },
  computed: {
    computedModalMessage() {
      return this.modalMessage;
    },
    filteredProducts() {
      return this.searchResults.filter(product => {
        return !this.stock_out_items.some(item => item.product === product._id);
      });
    }
  },
  methods: {
    removeItem(index) {
      this.stock_out_items.splice(index, 1);
    },
    validateState() {
      const { $dirty, $error } = this.$v.stock_out.remarks;
      return $dirty ? !$error : null;
    },
    clearSearchResults() {
      this.searchResults = [];
      this.filter.name = "";
      this.filter.barcode = "";
    },
    searchProducts() {
      if (this.filter.name == "") {
        delete this.filter.name;
      }
      if (this.filter.barcode == "") {
        delete this.filter.barcode;
      }
      listProducts({ filter: this.filter })
        .then(response => {
          this.searchResults = response.data;
          this.changeModalMessage();
        })
        .catch(error => {
          console.log(error);
        });
    },
    changeModalMessage() {
      if (this.searchResults.length === 0) {
        this.modalMessage = "No products found";
      } else if (this.filteredProducts.length === 0) {
        this.modalMessage = "All search results are already added";
      } else {
        this.modalMessage = "";
      }
    },
    addProduct(product) {
      this.stock_out_items.push({
        name: product.name,
        image: getImage(product.images),
        product: product._id,
        quantity: 1,
        current_quantity: product.current_quantity,
        current_sale_price: product.current_sale_price
      });
      this.changeModalMessage();
    },
    quantityChange(item) {
      item.quantity = Math.floor(item.quantity);
      if(item.quantity <= 0) {
        item.quantity = 1;
      } else if (item.quantity > item.current_quantity) {
        item.quantity = item.current_quantity;
      }
    },
    confirmAddStockOut() {
      if (this.stock_out.type === stockOutTypes.SCRAP) {
        this.$v.stock_out.$touch();
        if (this.$v.stock_out.$invalid) {
          return;
        }
      }
      this.upsert();
    },
    upsert() {
      this.stock_out.total_amount = this.stock_out_items.reduce((acc, item) => {
        return acc + (item.quantity * item.current_sale_price);
      }, 0);
      this.stock_out.total_qty = this.stock_out_items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
      let data = {
        stock_out: this.stock_out,
        stock_out_items: this.stock_out_items.map(item => {
          return { product: item.product, quantity: item.quantity };
        })
      };
      createStockOut(data)
        .then(response => {
          this.$router.push({
            name: "stockOut",
            params: {
              toastMessage: response.message
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    },
  }
};
</script>

<style lang="scss">
.table-input-field {
  width: 10rem;
}
.table-remove-field {
  width: 5rem;
  .remove-btn {
    height: 30px;
    width: 30px;
  }
}
</style>

<style lang="scss" scoped>
.attachment-list {
  display: flex;
  overflow-x: auto;
  padding-bottom: 1rem;
  .attachment-list-item {
    position: relative;
    margin: 1rem 1rem 0 0;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
    .delete-btn {
      cursor: pointer;
      position: absolute;
      top: -5px !important;
      right: -5px !important;
      height: 20px;
      width: 20px;
    }
  }
}
</style>
