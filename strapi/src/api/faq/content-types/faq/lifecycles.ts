import { revalidate } from "../../../../utils/revalidate"

export default {
  async afterCreate() {
    await revalidate("faqs")
  },
  async afterUpdate() {
    await revalidate("faqs")
  },
  async afterDelete() {
    await revalidate("faqs")
  },
}
