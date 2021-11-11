<template>
  <section>
    <div class="page-header">
      <h3 class="page-title">
        Stock-out records
      </h3>
    </div>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row class="mb-3">
              <b-col>
                <b-button-group>
                  <b-button
                    :variant="btnGroupIndex === 0 ? 'primary' : 'outline-primary'"
                    @click="changeTab(0)"
                  >
                    All
                  </b-button>
                  <b-button
                    v-for="index in Object.keys(stock_out_types)"
                    :key="index"
                    :variant="btnGroupIndex === index ? 'primary' : 'outline-primary'"
                    @click="changeTab(index)"
                  >
                    {{ stock_out_types[index] }}
                  </b-button>
                </b-button-group>
              </b-col>
              <b-col>
                <b-button
                  variant="success"
                  class="float-right"
                  @click="$router.push({ name: 'addStockOut' })"
                >
                  Add stocks
                </b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-table
                  striped
                  hover
                  responsive
                  stacked="md"
                  sort-icon-left
                  :busy.sync="isBusy"
                  :items="stockOutList"
                  :fields="fields"
                >
                  <template #table-busy>
                    <div class="text-center my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong> Loading...</strong>
                    </div>
                  </template>
                  <template #cell(no)="data">
                    {{ data.index + 1 }}
                  </template>
                  <template #cell(type)="data">
                    {{ stock_out_types[data.item.type] }}
                  </template>
                  <template #cell(total_amount)="data">
                    ${{ data.item.total_amount.toFixed(2) }}
                  </template>
                  <template #cell(date)="data">
                    {{ formatDate(data.item.date) }}
                  </template>
                  <template #cell(by)="data">
                    {{ data.item.by.first_name }} {{ data.item.by.last_name }}
                  </template>
                  <template #cell(actions)="data">
                    <b-button
                      class="btn btn-gradient-info btn-rounded btn-icon"
                      v-b-tooltip
                      title="View Details"
                      @click="viewDetails(data.item._id)"
                    >
                      <span class="mdi mdi-eye"></span>
                    </b-button>
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
      title="Stock-Out Information"
    >
      <b-container fluid v-if="item" class="bg-white pt-4">
        <b-row class="mb-4">
          <b-col cols="12" md="4" class="text-center my-3">
            Date: {{ formatDate(item.stock_out.date) }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            Type: {{ stock_out_types[item.stock_out.type] }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            By: {{ item.stock_out.by.first_name }} {{ item.stock_out.by.last_name }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3" v-if="item.stock_out.transaction_no">
            Transaction No. {{ item.stock_out.transaction_no }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            Total Cost: ${{ getTotalPrice(item).toFixed(2) }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            Total Sale: ${{ item.stock_out.total_amount.toFixed(2) }}
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
              :items="item.products"
              :fields="itemFields"
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
              <template #cell(cost)="data">
                ${{ data.item.cost.toFixed(2) }}
              </template>
              <template #cell(sale_price)="data">
                ${{ data.item.sale_price.toFixed(2) }}
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </section>
</template>

<script>
import { listStockOuts, getStockOut } from "@/api/stock-out";
import { stockOutTypes } from "@/util/enum";
import moment from "moment";
import { getImage, textOverflow } from "@/util/funcs";

export default {
  name: "StockOutCom",
  props: {
    toastMessage: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      getImage,
      textOverflow,
      btnGroupIndex: 0,
      showModel: false,
      isBusy: false,
      stockOutList: [],
      item: null,
      stock_out_types: {
        [stockOutTypes.SALE]: "Sale",
        [stockOutTypes.SCRAP]: "Scrapped",
        [stockOutTypes.ADMIN_DECREASE]: "Manual Decrease"
      },
      fields: [
        {
          key: "no",
          label: "No."
        },
        {
          key: "type",
          label: "Type"
        },
        {
          key: "transaction_no",
          label: "Transaction No."
        },
        {
          key: "total_amount",
          label: "Total Amount"
        },
        {
          key: "by",
          label: "By"
        },
        {
          key: "date",
          label: "Date"
        },
        {
          key: "actions",
          label: "Actions"
        }
      ],
      itemFields: [
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
          key: "cost",
          label: "Cost"
        },
        {
          key: "sale_price",
          label: "Sale Price"
        },
        {
          key: "quantity",
          label: "Quantity"
        }
      ]
    };
  },
  mounted() {
    if (this.toastMessage) {
      this.$bvToast.toast(this.toastMessage, {
        title: "Message",
        variant: "success",
        toaster: "b-toaster-top-center"
      });
    }
    this.getStockOuts();
  },
  methods: {
    changeTab(index) {
      this.btnGroupIndex = index;
      this.getStockOuts();
    },
    getTotalPrice(stock_out) {
      let total = 0;
      stock_out.products.forEach(product => {
        total += product.cost * product.quantity;
      });
      return total;
    },
    formatDate(date) {
      return moment(date).format("DD-MMM-YYYY hh:mmA");
    },
    viewDetails(id) {
      getStockOut(id).then(res => {
        this.item = res.data;
        this.showModel = true;
        console.log(this.item);
      });
    },
    getStockOuts() {
      this.isBusy = true;
      let filter;
      switch (this.btnGroupIndex) {
        case 0:
          filter = {};
          break;
        case "1":
          filter = { type: stockOutTypes.SALE };
          break;
        case "2":
          filter = { type: stockOutTypes.SCRAP };
          break;
        case "3":
          filter = { type: stockOutTypes.ADMIN_DECREASE };
          break;
        default:
          filter = {};
          break;
      }
      listStockOuts({ filter })
        .then(res => {
          this.stockOutList = res.data;
          this.isBusy = false;
          console.log(this.stockOutList);
        })
        .catch(err => {
          console.log(err);
          this.stockOutList = [];
          this.isBusy = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.table-image {
  width: 75px;
  height: 75px;
}
</style>
