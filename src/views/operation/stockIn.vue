<template>
  <section>
    <div class="page-header">
      <h3 class="page-title">
        Stock-in records
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
                    v-for="index in Object.keys(stock_in_types)"
                    :key="index"
                    :variant="btnGroupIndex === index ? 'primary' : 'outline-primary'"
                    @click="changeTab(index)"
                  >
                    {{ stock_in_types[index] }}
                  </b-button>
                </b-button-group>
              </b-col>
              <b-col>
                <b-button
                  variant="success"
                  class="float-right"
                  @click="$router.push({ name: 'addStockIn' })"
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
                  :items="stockInList"
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
                    {{ stock_in_types[data.item.type] }}
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
      title="Stock-In Information"
    >
      <b-container fluid v-if="item" class="bg-white pt-4">
        <b-row class="mb-4">
          <b-col cols="12" md="4" class="text-center my-3">
            Date: {{ formatDate(item.stock_in.date) }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3" v-if="item.stock_in.supplier">
            Supplier: {{ item.stock_in.supplier.name }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            Type: {{ stock_in_types[item.stock_in.type] }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            By: {{ item.stock_in.by.first_name }} {{ item.stock_in.by.last_name }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3" v-if="item.stock_in.transaction_no">
            Tran. No.: {{ item.stock_in.transaction_no }}
          </b-col>
          <b-col cols="12" md="4" class="text-center my-3">
            Total Cost: ${{ item.stock_in.total_amount.toFixed(2) }}
          </b-col>
        </b-row>
        <b-row v-if="item.stock_in.attachments.length > 0">
          <b-col>
            <b-form-group label="Attachment:">
              <b-list-group horizontal="md">
                <b-list-group-item v-for="(file, index) in item.stock_in.attachments" :key="index">
                  <a :href="getImage(file.file)" target="_blank">
                    {{ file.originalname }}
                  </a>
                </b-list-group-item>
              </b-list-group>
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
            </b-table>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </section>
</template>

<script>
import { listStockIns, getStockIn } from "@/api/stock-in";
import { stockInTypes } from "@/util/enum";
import moment from "moment";
import { getImage, textOverflow } from "@/util/funcs";

export default {
  name: "StockIn",
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
      stockInList: [],
      item: null,
      stock_in_types: {
        [stockInTypes.PURCHASE]: "Purchase",
        [stockInTypes.RETURN]: "Return",
        [stockInTypes.ADMIN_INCREASE]: "Manual Increase"
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
          key: "supplier.name",
          label: "Supplier"
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
    this.getStockIns();
  },
  methods: {
    changeTab(index) {
      this.btnGroupIndex = index;
      this.getStockIns();
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY hh:mmA");
    },
    viewDetails(id) {
      getStockIn(id).then(res => {
        this.item = res.data;
        this.showModel = true;
      });
    },
    getStockIns() {
      this.isBusy = true;
      let filter;
      switch (this.btnGroupIndex) {
        case 0:
          filter = {};
          break;
        case "1":
          filter = { type: stockInTypes.PURCHASE };
          break;
        case "2":
          filter = { type: stockInTypes.RETURN };
          break;
        case "3":
          filter = { type: stockInTypes.ADMIN_INCREASE };
          break;
        default:
          filter = {};
          break;
      }
      listStockIns({ filter })
        .then(res => {
          this.stockInList = res.data;
          this.isBusy = false;
        })
        .catch(err => {
          console.log(err);
          this.stockInList = [];
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
