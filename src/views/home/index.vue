<template>
  <section class="dashboard">
    <div class="page-header">
      <h3 class="page-title">
        <span class="page-title-icon bg-gradient-primary text-white mr-2">
          <i class="mdi mdi-home"></i>
        </span> Dashboard
      </h3>
      <nav aria-label="breadcrumb">
        <ul class="breadcrumb">
          <li class="breadcrumb-item active" aria-current="page">
            <span></span>Overview <i class="mdi mdi-alert-circle-outline icon-sm text-primary align-middle"></i>
          </li>
        </ul>
      </nav>
    </div>
    <div class="row">
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-danger card-img-holder text-white">
          <div class="card-body">
            <img src="../../assets/images/dashboard/circle.svg" class="card-img-absolute" alt="circle-image" />
            <h4 class="font-weight-normal mb-3">
              Weekly Sales <i class="mdi mdi-chart-line mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              $ 15,0000
            </h2>
            <h6 class="card-text">
              Increased by 60%
            </h6>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-info card-img-holder text-white">
          <div class="card-body">
            <img src="../../assets/images/dashboard/circle.svg" class="card-img-absolute" alt="circle-image" />
            <h4 class="font-weight-normal mb-3">
              Weekly Orders <i class="mdi mdi-bookmark-outline mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              45,6334
            </h2>
            <h6 class="card-text">
              Decreased by 10%
            </h6>
          </div>
        </div>
      </div>
      <div class="col-md-4 stretch-card grid-margin">
        <div class="card bg-gradient-success card-img-holder text-white">
          <div class="card-body">
            <img src="../../assets/images/dashboard/circle.svg" class="card-img-absolute" alt="circle-image" />
            <h4 class="font-weight-normal mb-3">
              Visitors Online <i class="mdi mdi-diamond mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">
              95,5741
            </h2>
            <h6 class="card-text">
              Increased by 5%
            </h6>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-7 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <div class="clearfix">
              <h4 class="card-title float-left">
                Visit And Sales Statistics
              </h4>
              <div id="visit-sale-chart-legend" class="rounded-legend legend-horizontal legend-top-right float-right">
                <ul>
                  <li>
                    <span class="legend-dots bg-gradient-primary"></span>CHN
                  </li> 
                  <li>
                    <span class="legend-dots bg-gradient-danger"></span>USA
                  </li> 
                  <li>
                    <span class="legend-dots bg-gradient-info"></span>UK
                  </li>
                </ul>
              </div>
            </div>
            <visitAndSalesStatitics class="mt-5" :height="170"></visitAndSalesStatitics>
          </div>
        </div>
      </div>
      <div class="col-md-5 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">
              Traffic Sources
            </h4>
            <trafficSourceChart :height="200"></trafficSourceChart>
            <div id="traffic-chart-legend" class="rounded-legend legend-vertical legend-bottom-left pt-4">
              <ul>
                <li>
                  <span class="legend-dots bg-gradient-info"></span>Search Engines
                  <span class="float-right">30%</span>
                </li> 
                <li>
                  <span class="legend-dots bg-gradient-success"></span>Direct Click
                  <span class="float-right">30%</span>
                </li> 
                <li>
                  <span class="legend-dots bg-gradient-danger"></span>Bookmarks Click
                  <span class="float-right">40%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import visitAndSalesStatitics from '../../components/charts/widgets/visitAndSalesStatitics'
import trafficSourceChart from '../../components/charts/widgets/trafficSourceChart'

export default {
  name: 'Dashboard',
  components: {
    trafficSourceChart,
    visitAndSalesStatitics
  },
  data() {
    return {
      time1: null
    };
  }
}
</script>

<style scoped>

</style>