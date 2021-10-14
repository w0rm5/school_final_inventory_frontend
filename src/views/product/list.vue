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
            <b-table
              striped
              hover
              responsive
              sort-icon-left
              :busy.sync="isBusy"
              :items="productsList"
              :fields="fields"
            >
              <template #cell(no)="data">
                {{ data.index + 1 }}
              </template>
              <template #cell(actions)="data">
                <b-button class="btn btn-gradient-info btn-rounded btn-sm">
                  Edit
                </b-button>
                <b-button class="btn btn-gradient-info btn-rounded btn-sm" @click="showSalePriceModal(data.item)">
                  Update Sale Price
                </b-button>
              </template>
            </b-table>
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
        <b-form class="pt-3" @submit.stop.prevent="updateSalePrice">
          <b-form-group
            label="New sale price"
          >
            <b-form-input
              class="form-control form-control-lg"
              v-model="newPrice"
              :state="validatePrice"
            ></b-form-input>
            <b-form-invalid-feedback>{{ salePriceFeedback }}</b-form-invalid-feedback>
          </b-form-group>
        </b-form>
      </b-modal>
    </div>
  </section>
</template>

<script>
import { listProducts, updateProductSalePrice } from "@/api/product"
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "BasicTables",
  mixins: [validationMixin],
  data() {
    return {
      productsList: [],
      currentProductId: '',
      showModel: false,
      isBusy: false,
      newPrice: 0,
      modalTitle: "",
      fields: [
        {
          key: "no",
          label: "No."
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
          key: "name",
          label: "Product Name",
          sortable: true
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
        "actions"
      ],
    };
  },
  validations: {
    newPrice: {
      required,
      isNum: v => !isNaN(v)
    }
  },
  computed: {
    validatePrice() {
      return !this.$v.newPrice.$invalid
    },
    salePriceFeedback() {
      if(!this.$v.newPrice.required) {
        return "Sale price is required"
      }
      if(!this.$v.newPrice.isNum) {
        return "Sale price must be a number"
      }
      return ""
    }
  },
  mounted() {
    this.getProducts()
  },
  methods: {
    getProducts() {
      listProducts({}).then(res => {
        this.productsList = res.data
      }).catch(err => {
        console.log(err);
        this.productsList = []
      })
    },
    showSalePriceModal(item) {
      this.showModel = true;
      this.resetModal()
      this.modalTitle = "Update " + item.name + "'s sale price"
      this.newPrice = item.current_sale_price
      this.currentProductId = item._id
    },
    resetModal() {
      this.$v.newPrice.$reset();
    },
    handleSalePriceOk(e) {
      e.preventDefault()
      this.updateSalePrice()
    },
    updateSalePrice() {
      this.$v.newPrice.$touch();
      if (this.$v.newPrice.$anyError) {
        return;
      }
      updateProductSalePrice(this.currentProductId, { update_price: this.newPrice })
      .then(res => {
        this.$bvToast.toast(res.message, {
          title: "Message",
          variant: "success",
          toaster: "b-toaster-top-center"
        })
        this.getProducts()
      }).catch(() => {})
      this.showModel = false;
    }
  }
};
</script>
