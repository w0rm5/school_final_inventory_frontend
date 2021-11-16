<template>
  <section>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row>
              <b-col cols="12" md="4">
                <b-form-group label="Stock in type: ">
                  <b-form-select v-model="stock_in.type" class="pt-2" :options="stock_in_types" @change="typeChange">
                  </b-form-select>
                </b-form-group>
              </b-col>
              <b-col cols="12" md="4" v-if="stock_in.type === stockInTypes.PURCHASE">
                <b-form-group label="Supplier: ">
                  <b-form-select
                    v-model="stock_in.supplier"
                    text-field="name"
                    value-field="_id"
                    :options="suppliers"
                    :state="validateState('supplier')"
                  ></b-form-select>
                  <b-form-invalid-feedback v-if="!$v.stock_in.supplier.required">
                    Supplier is required for purchase
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>
              <b-col cols="12" :md="stock_in.type === stockInTypes.PURCHASE ? '4' : '8'">
                <b-button variant="success" class="float-right" @click="showModel = true">
                  Add Product
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="12">
                <b-form-group label="Remarks">
                  <b-textarea v-model="stock_in.remarks" :state="validateState('remarks')"></b-textarea>
                  <b-form-invalid-feedback v-if="!$v.stock_in.remarks.required">
                    Remarks is required for manual stock in
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>
              <b-col cols="12">
                <b-form-group label="Attachments: ">
                  <b-form-file
                    multiple
                    v-model="uploadFiles"
                    accept="application/pdf"
                    placeholder="Select documents to upload"
                  ></b-form-file>
                </b-form-group>
              </b-col>
              <b-col cols="12">
                <b-list-group horizontal="md" class="attachment-list">
                  <b-list-group-item
                    v-for="(file, index) in filteredAttachments"
                    :key="index"
                    class="attachment-list-item"
                  >
                    <a :href="file.file" target="_blank">
                      {{ file.originalname }}
                    </a>
                    <b-button
                      class="
                        btn btn-danger btn-rounded btn-icon btn-sm
                        delete-btn
                      "
                      @click="removeAttachment(index)"
                    >
                      <i class="mdi mdi-close"></i>
                    </b-button>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-table
                  :items="stock_in_items"
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
                      class="form-control"
                      @change="quantityChange(data.item)"
                    ></b-form-input>
                  </template>
                  <template #cell(cost)="data">
                    <b-form-input
                      v-model.number="data.item.cost"
                      type="number"
                      min="0"
                      class="form-control"
                    ></b-form-input>
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
            <b-row v-if="stock_in_items.length">
              <b-col>
                <b-button variant="success" class="float-right" @click="confirmAddStockIn">
                  Add Stock In
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
import { createStockIn } from "@/api/stock-in";
import { listSuppliers } from "@/api/supplier";
import { multiUpload } from "@/api/upload";
import { textOverflow, getImage } from "@/util/funcs";
import { stockInTypes } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "AddStockIn",
  mixins: [validationMixin],
  data() {
    return {
      getImage,
      filter: { discontinued: false, name: "", barcode: "" },
      uploadFiles: [],
      suppliers: [],
      stockInTypes,
      stock_in_types: [
        { text: "Purchase", value: stockInTypes.PURCHASE },
        { text: "Manual Increase", value: stockInTypes.ADMIN_INCREASE }
      ],
      modalMessage: "",
      textOverflow,
      showModel: false,
      stock_in: {
        type: stockInTypes.PURCHASE,
        remarks: "",
        attachments: [],
        total_amount: 0
      },
      stock_in_items: [],
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
    stock_in: {
      supplier: {
        required
      },
      remarks: {
        required
      }
    }
  },
  computed: {
    filteredAttachments() {
      return this.uploadFiles.map(file => {
        return {
          originalname: file.name,
          file: URL.createObjectURL(file)
        };
      });
    },
    computedModalMessage() {
      return this.modalMessage;
    },
    filteredProducts() {
      return this.searchResults.filter(product => {
        return !this.stock_in_items.some(item => item.product === product._id);
      });
    }
  },
  mounted() {
    this.getSuppliers();
  },
  methods: {
    typeChange() {
      this.$v.stock_in.$reset();
    },
    quantityChange(item) {
      item.quantity = Math.floor(item.quantity);
      if(item.quantity <= 0) {
        item.quantity = 1;
      } else if (item.quantity > item.current_quantity) {
        item.quantity = item.current_quantity;
      }
    },
    removeItem(index) {
      this.stock_in_items.splice(index, 1);
    },
    removeAttachment(index) {
      this.uploadFiles.splice(index, 1);
    },
    validateState(key) {
      const { $dirty, $error } = this.$v.stock_in[key];
      return $dirty ? !$error : null;
    },
    getSuppliers() {
      listSuppliers()
        .then(response => {
          this.suppliers = response.data;
        })
        .catch(error => {
          console.log(error);
        });
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
      let mostRecentCost = product.cost_history.length
      this.stock_in_items.push({
        name: product.name,
        image: getImage(product.images),
        product: product._id,
        quantity: 1,
        cost: mostRecentCost ? product.cost_history[mostRecentCost - 1].cost : product.current_sale_price
      });
      this.changeModalMessage();
    },
    confirmAddStockIn() {
      if (this.stock_in.type === stockInTypes.PURCHASE) {
        this.$v.stock_in.supplier.$touch();
        if (this.$v.stock_in.supplier.$invalid) {
          return;
        }
      } else {
        this.$v.stock_in.remarks.$touch();
        if (this.$v.stock_in.remarks.$invalid) {
          return;
        }
        delete this.stock_in.supplier;
      }
      this.addStockIn();
    },
    upsert() {
      this.stock_in.total_amount = this.stock_in_items.reduce((acc, item) => {
        return acc + (item.quantity * item.cost);
      }, 0);
      this.stock_in.total_qty = this.stock_in_items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
      let data = {
        stock_in: this.stock_in,
        stock_in_items: this.stock_in_items.map(item => {
          return { product: item.product, quantity: item.quantity, cost: item.cost };
        })
      };
      createStockIn(data)
        .then(response => {
          this.$router.push({
            name: "stockIn",
            params: {
              toastMessage: response.message
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    },
    addStockIn() {
      if (this.uploadFiles.length) {
        let form = new FormData();
        for (let file of this.uploadFiles) {
          form.append("file", file);
        }
        multiUpload(form)
          .then(res => {
            this.stock_in.attachments.push(
              ...res.files.map(e => {
                return { originalname: e.originalname, file: e.filename };
              })
            );
            this.upsert();
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        this.upsert();
      }
    }
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
