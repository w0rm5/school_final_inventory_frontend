<template>
  <section>
    <div class="page-header">
      <h3 class="page-title">
        Stock in records
      </h3>
    </div>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row class="mb-3">
              <b-col>
                <b-button variant="success" class="float-right" @click="$router.push({ name: 'addStockIn' })">
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
                </b-table>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { listStockIns } from "@/api/stock-in";
export default {
  name: "StockIn",
  data() {
    return {
      isBusy: false,
      stockInList: [],
      fields: [
        {
          key: "no",
          label: "No."
        }
      ]
    };
  },
  mounted() {
    this.getStockIns();
  },
  methods: {
    getStockIns() {
      listStockIns({})
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style></style>
