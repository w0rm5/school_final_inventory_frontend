<template>
  <section>
    <div class="row">
      <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
          <div class="card-body">
            <b-row>
              <b-col>
                <b-form-input v-model="productSearch"></b-form-input>
                <b-list-group></b-list-group>
              </b-col>
            </b-row>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "AddStockIn",
  data() {
    return {
      productSearch: "",
      autocompleteList: []
    };
  }
};
</script>

<style></style>
