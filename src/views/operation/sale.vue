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
                <b-card-text>
                  <b>In stock:</b>
                  {{ product.current_quantity }}
                </b-card-text>
                <b-button
                  @click="addToCart(product)"
                  variant="primary"
                  :disabled="product.current_quantity <= 0"
                  class="p-2"
                >
                  Add to cart
                </b-button>
              </b-card>
            </b-card-group>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="12" lg="4" class="bg-white border py-4 shopping-cart-col">
        <b-row class="shopping-cart">
          <b-col cols="12">
            <h3 class="page-title mb-4">
              Shopping Cart
            </h3>
          </b-col>
          <b-col cols="12" align-self="stretch" class="cart overflow-auto">
            <div>
              <b-list-group>
                <b-list-group-item
                  v-for="(item, index) in cart"
                  :key="index"
                  :header="item.name"
                  class="border-0 p-0"
                >
                  <b-row class="mb-2">
                    <b-col cols="2" md="1">
                      <b-button
                        @click="removeFromCart(item.index)"
                        variant="danger"
                        size="sm"
                        class="p-1"
                      >
                        <span class="mdi mdi-close"></span>
                      </b-button>
                    </b-col>
                    <b-col cols="10" md="5" align-self="stretch">
                      {{ item.name }}
                    </b-col>
                    <b-col cols="6" md="2">
                      <span class="align-middle"> ${{ item.total.toFixed(2) }} </span>
                    </b-col>
                    <b-col cols="6" md="3">
                      <b-form-input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        :max="item.current_quantity"
                        class="mb-0"
                        size="sm"
                        @change="quantityChange(item)"
                      ></b-form-input>
                    </b-col>
                  </b-row>
                </b-list-group-item>
              </b-list-group>
            </div>
          </b-col>
          <b-col cols="12" align-self="end">
            <b-row>
              <b-col>
                <h3 class="page-title">
                  Total:
                </h3>
              </b-col>
              <b-col>
                <h3 class="page-title text-right">
                  ${{ total }}
                </h3>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            <b-button
              @click="checkout"
              variant="primary"
              class="w-100"
              :disabled="cart.length <= 0"
            >
              Checkout
            </b-button>
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
      return this.stock_out_items.map((item, index) => {
        let product = this.productsList.find(product => product._id === item.product);
        return {
          index,
          name: product.name,
          quantity: item.quantity,
          price: product.current_sale_price,
          total: item.quantity * product.current_sale_price,
          current_quantity: product.current_quantity
        };
      });
    },
    total() {
      return this.cart.reduce((total, item) => total + item.total, 0).toFixed(2);
    }
  },
  mounted() {
    this.stock_out.by = this.userInfo._id;
    this.getProducts();
  },
  methods: {
    addToCart(product) {
      let index = this.stock_out_items.findIndex(item => item.product === product._id);
      if (index === -1) {
        this.stock_out_items.push({
          name: product.name,
          product: product._id,
          price: product.current_sale_price,
          quantity: 1,
          current_quantity: product.current_quantity
        });
      } else if (this.stock_out_items[index].quantity < product.current_quantity) {
        this.stock_out_items[index].quantity++;
      }
    },
    quantityChange(item) {
      if (item.quantity > item.current_quantity) {
        item.quantity = item.current_quantity;
      }
      this.stock_out_items[item.index].quantity = item.quantity;
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
    },
    checkout() {}
  }
};
</script>

<style lang="scss">
.card-img-top {
  height: 15rem;
  object-fit: cover;
}
.shopping-cart-col {
  height: 75vh;
  .shopping-cart {
    height: 100%;
    margin-bottom: 1.75rem;
    .cart {
      height: 85%;
    }
  }
}
</style>
