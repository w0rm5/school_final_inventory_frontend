<template>
  <section>
    <div class="page-header">
      <h3 class="page-title">
        {{ product._id ? "Edit" : "Add" }} Product
      </h3>
    </div>
    <div class="row">
      <div class="col-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-form @submit.stop.prevent="saveProduct">
              <b-form-row>
                <b-col cols="12" :md="$route.params.id === 'new' ? 6 : 4">
                  <b-form-group label="Name">
                    <b-form-input v-model="product.name"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="12" :md="$route.params.id === 'new' ? 6 : 4">
                  <b-form-group label="Barcode">
                    <b-form-input v-model="product.barcode"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col cols="12" :md="$route.params.id === 'new' ? 6 : 4">
                  <b-form-group label="Category">
                    <b-form-select
                      v-model="product.category"
                      text-field="name"
                      value-field="_id"
                      :options="categoryList"
                    ></b-form-select>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="6" v-if="$route.params.id === 'new'">
                  <b-form-group label="Sale Price">
                    <b-form-input v-model="product.current_sale_price"></b-form-input>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12">
                  <b-form-group label="Product Description">
                    <b-form-textarea v-model="product.description"></b-form-textarea>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12">
                  <b-button
                    class="btn btn-gradient-success btn-fw mt-3 ml-3 float-right"
                    type="submit"
                  >
                    Save
                  </b-button>
                  <b-button
                    class="btn btn-gradient-dark btn-fw mt-3 ml-3 float-right"
                    @click="$router.push({ name: 'productList' })"
                  >
                    Cancel
                  </b-button>
                </b-col>
              </b-form-row>
            </b-form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { listCategory } from "@/api/category";
import { getProductById, upsertProduct, getProductByName } from "@/api/product";
import { meta } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "ProductEditCom",
  mixins: [validationMixin],
  data() {
    return {
      categoryList: [],
      product: {
        barcode: "",
        category: "",
        current_sale_price: 0,
        description: "",
        discontinued: false,
        images: [],
        name: ""
      }
    };
  },
  validations: {
    product: {
      barcode: {
        required
      },
      category: {
        required
      },
      current_sale_price: {
        required,
        isNum: v => !isNaN(v)
      },
      description: {
        required
      },
      name: {
        required,
        async isUnique(value) {
          if (value === "") return true;
          let res = await getProductByName({ name: value })

            // .then(res => {
            //   console.log("res",res);
            //   if (res.meta === meta.OK) return false;
            //   else if (res.meta === meta.NOT_FOUND) return true;
            // })
            // .catch(err => {
            //   console.log("err", err);
            //   return false
            // });
          console.log(res);
          return await res.meta === meta.NOT_FOUND
        }
      }
    }
  },
  created() {
    listCategory()
      .then(res => {
        this.categoryList = res.data;
        let id = this.$route.params.id;
        if (id !== "new") {
          getProductById(id)
            .then(res => {
              this.product = res.data;
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    saveProduct() {
      this.$v.product.$touch();
      console.log(this.$v.product.name);
      
      let valid = false;
      if (valid) {
        upsertProduct(this.product)
          .then(() => {
            this.$router.push({
              name: "productList",
              params: {
                toastMessage: "Product saved"
              }
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }
};
</script>

<style></style>
