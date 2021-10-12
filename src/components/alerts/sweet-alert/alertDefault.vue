<template>
  <section class="alert-default">
    <button class="btn btn-outline-success" @click="showAlert">
      Click here!
    </button>
  </section>
</template>

<script>
export default {
  name: 'AlertDefault',
  methods: {
    showAlert () {
      this.$swal('Hello Vue world!!!')
    }
  }
}
</script>
