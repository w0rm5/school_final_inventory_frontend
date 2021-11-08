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
                    <b-form-input
                      v-model.trim="product.name"
                      :state="validateState('name')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.product.name.required">
                      Product name is required
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-else-if="!$v.product.name.isUnique">
                      Product name is already in used
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" :md="$route.params.id === 'new' ? 6 : 4">
                  <b-form-group label="Barcode">
                    <b-form-input
                      v-model="product.barcode"
                      :state="validateState('barcode')"
                    ></b-form-input>
                    <b-form-invalid-feedback v-if="!$v.product.barcode.required">
                      Barcode is required
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-else-if="!$v.product.barcode.numeric">
                      Barcode must be numbers
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-else-if="!$v.product.barcode.isUnique">
                      Barcode is already in used
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-else-if="!$v.product.barcode.minLength">
                      Barcode must be at least 3 characters
                    </b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" :md="$route.params.id === 'new' ? 6 : 4">
                  <b-form-group label="Category">
                    <b-form-select
                      v-model="product.category"
                      text-field="name"
                      value-field="_id"
                      :options="categoryList"
                      :state="validateState('category')"
                    ></b-form-select>
                    <b-form-invalid-feedback>Category is required</b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
                <b-col cols="12" md="6" v-if="$route.params.id === 'new'">
                  <b-form-group label="Sale Price">
                    <b-form-input
                      v-model="product.current_sale_price"
                      :state="validateState('current_sale_price')"
                    ></b-form-input>
                    <b-form-invalid-feedback>Sale price is required</b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12">
                  <b-form-group label="Product Description">
                    <b-form-textarea
                      v-model="product.description"
                      :state="validateState('description')"
                    ></b-form-textarea>
                    <b-form-invalid-feedback>Description is required</b-form-invalid-feedback>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col>
                  <b-form-group label="Product Images">
                    <b-form-file
                      multiple
                      v-model="uploadImages"
                      accept="image/jpeg, image/png"
                      placeholder="Select images to upload for the product"
                    ></b-form-file>
                  </b-form-group>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col class="image-list">
                  <div class="img-item" v-for="(img, index) in previewImages" :key="index">
                    <b-img :src="img"></b-img>
                    <b-button
                      class="
                        btn btn-danger btn-rounded btn-icon btn-sm
                        delete-btn
                      "
                      @click="removeImage(index)"
                    >
                      <i class="mdi mdi-close"></i>
                    </b-button>
                  </div>
                </b-col>
              </b-form-row>
              <b-form-row>
                <b-col cols="12">
                  <b-button
                    class="
                      btn btn-gradient-success btn-fw
                      mt-3
                      ml-3
                      float-right
                    "
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
import { multiUpload, deleteMultipleFiles } from "@/api/upload";
import { getImage } from "@/util/funcs";
import { getProductById, upsertProduct, getOneProduct } from "@/api/product";
import { meta } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required, numeric, minLength } from "vuelidate/lib/validators";

export default {
  name: "ProductEdit",
  mixins: [validationMixin],
  data() {
    return {
      categoryList: [],
      uploadImages: [],
      deleteImages: [],
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
        required,
        numeric,
        minLength: minLength(3),
        async isUnique(value) {
          if (value === "") return true;
          let res = await getOneProduct({ barcode: value });
          return res.meta === meta.NOT_FOUND || res.id === this.product._id;
        }
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
          let res = await getOneProduct({ name: value });
          return res.meta === meta.NOT_FOUND || res.id === this.product._id;
        }
      }
    }
  },
  computed: {
    previewImages() {
      let oldImg = this.product.images.map(e => getImage(e));
      let urlImgs = this.uploadImages.map(e => URL.createObjectURL(e));
      return [...oldImg, ...urlImgs];
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
            .catch(error => {
              console.log(error);
            });
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    validateState(name) {
      const { $dirty, $error } = this.$v.product[name];
      return $dirty ? !$error : null;
    },
    removeImage(index) {
      if (this.product.images[index]) {
        this.deleteImages.push(this.product.images[index]);
        this.product.images.splice(index, 1);
      } else {
        this.uploadImages.splice(index - this.product.images.length, 1);
      }
    },
    upsert() {
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
    },
    uploadThenUpsert() {
      if (this.uploadImages.length) {
        let form = new FormData();
        for (let img of this.uploadImages) {
          form.append("file", img);
        }
        multiUpload(form)
          .then(res => {
            this.product.images.push(...res.files.map(e => e.filename));
            this.upsert();
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        this.upsert();
      }
    },
    saveProduct() {
      this.$v.product.$touch();
      if (!this.$v.product.$invalid) {
        if (this.deleteImages.length) {
          deleteMultipleFiles(this.deleteImages)
            .then(() => {
              this.uploadThenUpsert();
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          this.uploadThenUpsert();
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.image-list {
  display: flex;
  overflow-x: auto;
  .img-item {
    position: relative;
    img {
      padding: 10px 5px;
      height: 200px;
    }
    .delete-btn {
      cursor: pointer;
      position: absolute;
      top: 0px !important;
      right: 0px !important;
      height: 20px;
      width: 20px;
    }
  }
}
</style>
