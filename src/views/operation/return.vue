<template>
  <b-container fluid class="bg-white border py-4">
    <b-row>
      <b-col>
        <b-form-group label="Transaction number:">
          <b-input-group>
            <b-form-input
              placeholder="Please enter transaction number"
              @keypress.enter="getProduct"
              v-model.trim="transaction_no"
            ></b-form-input>
            <b-input-group-append>
              <b-button class="btn btn-gradient-info" @click="getProduct">
                <span class="mdi mdi-magnify"></span>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form-group label="Remarks">
          <b-textarea v-model="remarks" :state="validateState()"></b-textarea>
          <b-form-invalid-feedback v-if="!$v.remarks.required">
            Remarks are required
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          hover
          responsive
          striped
          stacked="md"
          sort-icon-left
          :items="products"
          :fields="fields"
        >
          <template #cell(no)="data">
            {{ data.index + 1 }}
          </template>
          <template #cell(name)="data">
            {{ textOverflow(data.item.name, 20) }}
          </template>
          <template #cell(image)="data">
            <b-img
              class="table-image"
              :src="getImage(data.item.product.images)"
              :alt="'Image of ' + data.item.product.name"
            ></b-img>
          </template>
          <template #cell(sale_price)="data">
            ${{ data.item.sale_price ? data.item.sale_price.toFixed(2) : "0.00" }}
          </template>
          <template #cell(return_quantity)="data">
            <b-form-input
              v-if="data.item.quantity > data.item.previous_return"
              v-model.number="data.item.return_quantity"
              type="number"
              :min="1"
              :max="data.item.quantity"
              @change="quantityChange(data.item)"
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
    <b-row v-if="products.length > 0">
      <b-col>
        <b-button variant="primary" class="float-right" @click="returnProducts">
          Return products
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { getStockOutByTransNum } from "@/api/stock-out";
import { createStockIn } from "@/api/stock-in";
import { getImage, textOverflow } from "@/util/funcs";
import { stockInTypes } from "@/util/enum";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "ReturnComponent",
  mixins: [validationMixin],
  data() {
    return {
      getImage,
      textOverflow,
      transaction_no: "",
      remarks: "",
      products: [],
      stock_out: {},
      fields: [
        {
          key: "no",
          label: "No."
        },
        {
          key: "image",
          label: "Image"
        },
        {
          key: "product.name",
          label: "Name"
        },
        {
          key: "product.category.name",
          label: "Category"
        },
        {
          key: "product.barcode",
          label: "Barcode"
        },
        {
          key: "sale_price",
          label: "Sale Price"
        },
        {
          key: "quantity",
          label: "Purchase Quantity"
        },
        {
          key: "previous_return",
          label: "Previously Returned"
        },
        {
          key: "return_quantity",
          label: "Return Quantity",
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
    remarks: {
      required
    }
  },
  methods: {
    removeItem(index) {
      this.products.splice(index, 1);
    },
    validateState() {
      const { $dirty, $error } = this.$v.remarks;
      return $dirty ? !$error : null;
    },
    quantityChange(item) {
      item.return_quantity = Math.floor(item.return_quantity);
      if (item.return_quantity <= 0) {
        item.return_quantity = 1;
      } else if (item.return_quantity > item.quantity) {
        item.return_quantity = item.quantity;
      }
    },
    getProduct() {
      if (this.transaction_no) {
        getStockOutByTransNum(this.transaction_no)
          .then(res => {
            this.products = res.data.products.map(item => {
              item.return_quantity = 1;
              item.previous_return = 0;
              return item;
            });
            if (res.data.return.length > 0) {
              for (let i = 0; i < this.products.length; i++) {
                for (let j = 0; j < res.data.return.length; j++) {
                  if (this.products[i].product._id === res.data.return[j].product) {
                    this.products[i].previous_return += res.data.return[j].quantity;
                    this.products[i].return_quantity =
                      this.products[i].quantity - this.products[i].previous_return;
                  }
                }
              }
            }
            this.stock_out = res.data.stock_out;
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    returnProducts() {
      this.$v.remarks.$touch();
      if (this.$v.remarks.$invalid) {
        return;
      }
      let stock_in = {
        sale_return: this.stock_out._id,
        type: stockInTypes.RETURN,
        remarks: this.remarks,
        total_amount: this.products.reduce((total, item) => {
          return total + (item.return_quantity * item.sale_price);
        }, 0),
        total_qty: this.products.reduce((total, item) => {
          return total + item.return_quantity;
        }, 0)
      };
      let stock_in_items = [];
      for (let item of this.products) {
        if (item.return_quantity > 0) {
          stock_in_items.push({
            product: item.product._id,
            quantity: item.return_quantity,
            cost: item.cost
          });
        }
      }
      let data = {
        stock_in,
        stock_in_items
      };
      createStockIn(data)
        .then(response => {
          this.$bvToast.toast(response.message, {
            title: "Message",
            variant: "success",
            toaster: "b-toaster-top-center"
          });
          this.transaction_no = "";
          this.remarks = "";
          this.products = [];
          this.stock_out = {};
          this.$v.remarks.$reset();
        })
        .catch(error => {
          console.log(error);
        });
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
.table-image {
  width: 75px;
  height: 75px;
}
</style>
