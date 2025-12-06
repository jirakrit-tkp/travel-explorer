<script setup lang="ts">
import { RouterView } from 'vue-router'
import Snackbar from './components/Snackbar.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { useSnackbar } from './composables/useSnackbar'
import { useConfirm } from './composables/useConfirm'

const snackbar = useSnackbar()
const confirm = useConfirm()
</script>

<template>
  <RouterView />
  <Snackbar
    :show="snackbar.show.value"
    :message="snackbar.message.value"
    :type="snackbar.type.value"
    :duration="snackbar.duration.value"
    @close="snackbar.hideSnackbar"
  />
  <ConfirmModal
    :show="confirm.show.value"
    :title="confirm.title.value"
    :message="confirm.message.value"
    :confirm-text="confirm.confirmText.value"
    :cancel-text="confirm.cancelText.value"
    :confirm-button-class="confirm.confirmButtonClass.value"
    @confirm="confirm.handleConfirm"
    @cancel="confirm.handleCancel"
  />
</template>

<style scoped>
/* App styles */
</style>
