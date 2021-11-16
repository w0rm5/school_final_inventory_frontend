<template>
  <section class="dashboard">
    <div class="page-header">
      <h3 class="page-title">
        <span class="page-title-icon bg-gradient-primary text-white mr-2">
          <i class="mdi mdi-home"></i>
        </span>
        Dashboard
      </h3>
      <nav aria-label="breadcrumb">
        <ul class="breadcrumb">
          <li class="breadcrumb-item active" aria-current="page">
            <span></span>Overview
            <i class="mdi mdi-alert-circle-outline icon-sm text-primary align-middle"></i>
          </li>
        </ul>
      </nav>
    </div>
    <div class="row">
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-danger card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Today's Sales <i class="mdi mdi-chart-line mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              $ {{ todaySales.toFixed(2) }}
            </h2>
            <h6 class="card-text">
              {{
                saleIncrease > 0
                  ? "Increased by " + saleIncrease.toFixed(2)
                  : "Decreased by " + (saleIncrease * -1).toFixed(2)
              }}%
            </h6>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-info card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Today's Orders <i class="mdi mdi-bookmark-outline mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              {{ todayCustomers }}
            </h2>
            <h6 class="card-text">
              {{
                customerIncrease > 0
                  ? "Increased by " + customerIncrease.toFixed(2)
                  : "Decreased by " + (customerIncrease * -1).toFixed(2)
              }}%
            </h6>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-success card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Today's Products Sold <i class="mdi mdi-diamond mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              {{ todayProductsSold }}
            </h2>
            <h6 class="card-text">
              {{
                productsSoldIncrease > 0
                  ? "Increased by " + productsSoldIncrease.toFixed(2)
                  : "Decreased by " + (productsSoldIncrease * -1).toFixed(2)
              }}%
            </h6>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-primary card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              This Month's Sales <i class="mdi mdi-chart-line mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              $ {{ monthlySales.toFixed(2) }}
            </h2>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-warning card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              This Month's Orders <i class="mdi mdi-bookmark-outline mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              {{ monthlyCustomers }}
            </h2>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-danger card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              This Month's Products Sold <i class="mdi mdi-diamond mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              {{ monthlyProductsSold }}
            </h2>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { listStockOuts } from "@/api/stock-out";
import moment from "moment";

export default {
  name: "Dashboard",
  data() {
    return {
      todaySales: 0,
      todayCustomers: 0,
      todayProductsSold: 0,
      yesterdaySales: 0,
      yesterdayCustomers: 0,
      yesterdayProductsSold: 0,
      monthlySales: 0,
      monthlyCustomers: 0,
      monthlyProductsSold: 0,
    };
  },
  computed: {
    saleIncrease() {
      return this.yesterdaySales
        ? ((this.todaySales - this.yesterdaySales) / this.yesterdaySales) * 100
        : 100;
    },
    customerIncrease() {
      return this.yesterdayCustomers
        ? ((this.todayCustomers - this.yesterdayCustomers) / this.yesterdayCustomers) * 100
        : 100;
    },
    productsSoldIncrease() {
      return this.yesterdayProductsSold
        ? ((this.todayProductsSold - this.yesterdayProductsSold) / this.yesterdayProductsSold) * 100
        : 100;
    },
  },
  mounted() {
    this.getDailySalesReports();
    this.getMonthlySalesReports();
  },
  methods: {
    getDailySalesReports() {
      let startOfDay = moment().startOf("day");
      let date = [startOfDay.toDate(), startOfDay.add(1, "days").toDate()];
      listStockOuts({ filter: { date } })
        .then(res => {
          this.todaySales = res.data.reduce((acc, cur) => acc + cur.total_amount, 0);
          this.todayCustomers = res.data.length;
          this.todayProductsSold = res.data.reduce((acc, cur) => acc + cur.total_qty, 0);
          date = [startOfDay.add(-2, "days").toDate(), startOfDay.add(1, "days").toDate()];
          listStockOuts({ filter: { date } })
            .then(res2 => {
              this.yesterdaySales = res2.data.reduce((acc, cur) => acc + cur.total_amount, 0);
              this.yesterdayCustomers = res2.data.length;
              this.yesterdayProductsSold = res2.data.reduce((acc, cur) => acc + cur.total_qty, 0);
            })
            .catch(err2 => {
              console.log(err2);
            });
        })
        .catch(err => {
          console.log(err);
        });
    },
    getMonthlySalesReports() {
      let startOfMonth = moment().startOf("month");
      let date = [startOfMonth.toDate(), startOfMonth.add(1, "months").toDate()];
      listStockOuts({ filter: { date } })
        .then(res => {
          console.log(res);
          this.monthlySales = res.data.reduce((acc, cur) => acc + cur.total_amount, 0);
          this.monthlyCustomers = res.data.length;
          this.monthlyProductsSold = res.data.reduce((acc, cur) => acc + cur.total_qty, 0);
        })
        .catch(err => {
          console.log(err);
        });
    },
  }
};
</script>

<style scoped></style>
