<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="8" class="bg-white border py-4">
        <b-row>
          <b-col cols="12" md="6" class="py-2">
            <b-input-group>
              <b-form-input placeholder="Search product by name"></b-form-input>
              <b-input-group-append>
                <b-button class="btn btn-gradient-info">
                  <span class="mdi mdi-magnify"></span>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col cols="12" md="6" class="py-2">
            <b-input-group>
              <b-form-input placeholder="Search product by barcode"></b-form-input>
              <b-input-group-append>
                <b-button class="btn btn-gradient-info">
                  <span class="mdi mdi-magnify"></span>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-card-group columns>
              <b-card
                v-for="product in productsList"
                :key="product._id"
                :title="product.name"
                :img-src="getProductImage(product.images)"
                :img-alt="product.name"
                img-top
                class="border"
                align="center"
              >
                <b-card-text>
                  {{ product.description }}
                </b-card-text>
                <b-button @click="addToCart(product._id)" variant="primary">
                  Add to cart
                </b-button>
              </b-card>
            </b-card-group>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="12" lg="4" class="bg-white border py-4">
        <b-row>
          <b-col cols="12">
            <h3 class="page-title mb-4">
              Shopping Cart
            </h3>
            <b-list-group>
              <b-list-group-item
                v-for="(item, index) in cart"
                :key="index"
                :header="item.name"
                class="flex-column align-items-start border-0"
              >
                {{ item.name }}
                <b-button @click="removeFromCart(index)" variant="danger" class="float-right">
                  Remove From Cart
                </b-button>
              </b-list-group-item>
            </b-list-group>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { listProducts } from "@/api/product";
import serverConfig from "@/util/serverConfig";
import { stockOutTypes } from "@/util/enum";
import { mapGetters } from "vuex";

export default {
  name: "SaleComponent",
  data() {
    return {
      productsList: [],
      stock_out_items: [],
      stock_out: {
        by: "",
        type: stockOutTypes.SALE
      }
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    cart() {
      return this.stock_out_items.map(item => {
        let product = this.productsList.find(product => product._id === item.product);
        return {
          name: product.name,
          quantity: item.quantity,
          price: product.current_sale_price,
          total: item.quantity * product.current_sale_price
        };
      });
    }
  },
  mounted() {
    this.stock_out.by = this.userInfo._id;
    this.getProducts();
  },
  methods: {
    addToCart(id) {
      let index = this.stock_out_items.findIndex(item => item.product === id);
      if (index === -1) {
        this.stock_out_items.push({
          product: id,
          quantity: 1
        });
      } else {
        this.stock_out_items[index].quantity++;
      }
    },
    removeFromCart(index) {
      this.stock_out_items.splice(index, 1);
    },
    getProductImage(images) {
      if (images[0]) {
        return serverConfig.file_url + images[0];
      }
      return serverConfig.no_image_url;
    },
    getProducts() {
      listProducts({ filter: { discontinued: false }, populatePath: "category" })
        .then(res => {
          this.productsList = res.data;
        })
        .catch(err => {
          console.log(err);
          this.productsList = [];
        });
    }
  }
};
</script>

<style lang="scss">
.card-img-top {
  height: 15rem;
  object-fit: cover;
}
</style>
