<template>
  <section>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row class="mb-3">
              <b-col>
                <b-button variant="success" class="float-right" @click="showModel = true">
                  Add Product
                </b-button>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>
    <b-modal v-model="showModel" size="xl" scrollable no-close-on-backdrop ok-only>
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
      <b-container fluid>
        <b-row>
          <b-col cols="12" class="vh-50">
            <b-list-group>
              <b-list-group-item
                v-for="product in filteredProducts"
                :key="product._id"
                @click="addProduct(product)"
              >
                <b-row>
                  <b-col cols="3">
                    <b-img
                      class="rounded-circle"
                      :src="getProductImage(product.images)"
                      alt="Product Image"
                      width="50"
                      height="50"
                    ></b-img>
                  </b-col>
                  <b-col cols="6"> Product: {{ product.name }} </b-col>
                  <b-col cols="3"> Quantity: {{ product.current_quantity }} </b-col>
                </b-row>
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

export default {
  name: "AddStockIn",
  data() {
    return {
      showModel: false,
      productSearch: "",
      stock_in_items: [],
      searchResults: []
    };
  },
  computed: {
    filteredProducts() {
      return this.searchResults.filter(product => {
        return !this.stock_in_items.some(item => item.product === product._id);
      });
    }
  },
  methods: {
    getProductImage(images) {
      if (images[0]) {
        return serverConfig.file_url + images[0];
      }
      return serverConfig.no_image_url;
    },
    searchProducts() {
      let filter = { discontinued: false };
      if(this.productSearch) {
        filter.name = this.productSearch
      }
      console.log(filter);
      listProducts({ filter })
        .then(response => {
          this.searchResults = response.data;
          console.log(this.searchResults);
        })
        .catch(error => {
          console.log(error);
        });
    },
    addProduct(product) {
      this.stock_in_items.push({
        product: product._id,
        quantity: 1,
        cost: product.current_sale_price
      });
      this.productSearch = "";
    }
  }
};
</script>

<style></style>
