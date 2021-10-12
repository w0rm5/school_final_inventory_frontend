<template>
  <section class="alert-animated">
    <button class="btn btn-outline-success" @click="showAlert">
      Click here!
    </button>
  </section>
</template>

<script>
export default {
  name: 'AlertAnimated',
  methods: {
    showAlert () {
      this.$swal({
        title: 'Custom animation with Animate.css',
        animation: false,
        customClass: 'animated tada'
      })
    }
  }
}
</script>
