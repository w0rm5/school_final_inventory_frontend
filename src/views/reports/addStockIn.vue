<template>
  <section>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row>
              <b-col>
                <b-form-group label="Stock in type: " label-cols-md="3">
                  <b-form-radio-group v-model="stock_in.type" :options="stock_in_types" class="pt-3"></b-form-radio-group>
                </b-form-group>
              </b-col>
              <b-col>
                <b-button variant="success" class="float-right" @click="showModel = true">
                  Add Product
                </b-button>
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
                </b-table>
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
            <b-col cols="12">
              <b-input-group>
                <b-form-input
                  v-model="productSearch"
                  placeholder="Search"
                  @keyup.enter="searchProducts"
                  type="search"
                ></b-form-input>
                <b-input-group-append>
                  <b-button @click="searchProducts" variant="outline-info">
                    <i class="mdi mdi-magnify"></i>
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
                    :src="getProductImage(product.images)"
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
import serverConfig from "@/util/serverConfig";
import { listProducts } from "@/api/product";
import { textOverflow } from "@/util/funcs";
import { stockInTypes } from "@/util/enum";

export default {
  name: "AddStockIn",
  data() {
    return {
      stock_in_types: [
        { text: "Purchase", value: stockInTypes.PURCHASE },
        { text: "Return", value: stockInTypes.RETURN },
        { text: "Manual Increase", value: stockInTypes.ADMIN_INCREASE }
      ],
      modalMessage: "",
      textOverflow,
      showModel: false,
      productSearch: "",
      stock_in: {
        type: stockInTypes.PURCHASE
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
        }
      ]
    };
  },
  computed: {
    computedModalMessage() {
      return this.modalMessage;
    },
    filteredProducts() {
      return this.searchResults.filter(product => {
        return !this.stock_in_items.some(item => item.product === product._id);
      });
    }
  },
  methods: {
    clearSearchResults() {
      this.searchResults = [];
      this.productSearch = "";
    },
    getProductImage(images) {
      if (images[0]) {
        return serverConfig.file_url + images[0];
      }
      return serverConfig.no_image_url;
    },
    searchProducts() {
      let filter = { discontinued: false };
      if (this.productSearch) {
        filter.name = this.productSearch;
      }
      listProducts({ filter })
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
      this.stock_in_items.push({
        name: product.name,
        image: this.getProductImage(product.images),
        product: product._id,
        quantity: 1,
        cost: product.current_sale_price
      });
      this.changeModalMessage();
    }
  }
};
</script>

<style lang="scss">
.table-input-field {
  width: 10rem;
}
</style>
